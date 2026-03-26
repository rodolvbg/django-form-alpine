from django.forms import Media
from django.test import SimpleTestCase, override_settings

from django_form_alpine import AdminAlpineMixin, FormAlpineMixin


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
