import django
from django.forms import Media
from django.test import SimpleTestCase, override_settings

from django_form_alpine import AdminAlpineMixin, FormAlpineMixin
from django_form_alpine.contrib.unfold import UnfoldAdminAlpineMixin


class MockBase:
    @property
    def media(self):
        return Media(js=["base.js"])


class MockFormWithMixin(FormAlpineMixin, MockBase):
    pass


class MockAdminWithMixin(AdminAlpineMixin, MockBase):
    pass


class FormAlpineMixinTest(SimpleTestCase):
    def test_media_includes_alpine_js(self):
        """
        Verify that FormAlpineMixin adds alpine.js to the media.
        """
        instance = MockFormWithMixin()
        media_js = str(instance.media)
        self.assertIn("django_form_alpine/js/alpine.js", media_js)
        alpine_js = 'src="/static/django_form_alpine/js/alpine.js"'
        self.assertIn(alpine_js, media_js)
        if django.VERSION >= (5, 2):
            # Media's Script asset (the only way to get `defer` onto a
            # <script> tag here) was added in Django 5.2 — see the
            # django.forms import fallback in mixins.py.
            self.assertIn("defer", media_js)


class AdminAlpineMixinTest(SimpleTestCase):
    def test_media_includes_alpine_and_admin_js(self):
        """
        Verify that AdminAlpineMixin adds admin.js and alpine.js to the media.
        """
        instance = MockAdminWithMixin()
        media_js = str(instance.media)

        self.assertIn("django_form_alpine/js/admin.js", media_js)
        self.assertIn("django_form_alpine/js/alpine.js", media_js)
        admin_js = 'src="/static/django_form_alpine/js/admin.js"'
        self.assertIn(admin_js, media_js)
        if django.VERSION >= (5, 2):
            self.assertIn("defer", media_js)

    def test_media_preserves_base_media(self):
        """
        Verify that original media from the base class is preserved.
        """
        instance = MockAdminWithMixin()
        media_js = str(instance.media)
        self.assertIn("base.js", media_js)

    @override_settings(django_form_alpine_JS_PATH="custom/alpine.js")
    def test_custom_alpine_js_path(self):
        """
        Verify that django_form_alpine_JS_PATH setting is respected.
        """
        instance = MockAdminWithMixin()
        media_js = str(instance.media)
        self.assertIn("custom/alpine.js", media_js)
        self.assertNotIn("django_form_alpine/js/alpine.js", media_js)


class MockUnfoldWithMixin(UnfoldAdminAlpineMixin, MockBase):
    pass


class UnfoldAdminAlpineMixinTest(SimpleTestCase):
    def test_media_uses_unfolds_alpine(self):
        """
        Verify that UnfoldAdminAlpineMixin adds its preset and core.js as plain
        scripts, before Unfold's deferred Alpine.js, and no Alpine.js of its own.
        """
        media_js = str(MockUnfoldWithMixin().media)

        self.assertIn("base.js", media_js)
        self.assertNotIn("alpine.js", media_js)
        self.assertNotIn("admin.js", media_js)
        self.assertNotIn("defer", media_js)
        self.assertLess(
            media_js.index("django_form_alpine/js/contrib/unfold.js"),
            media_js.index("django_form_alpine/js/core.js"),
        )
