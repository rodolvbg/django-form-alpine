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


class MockUnfoldWithMixin(UnfoldAdminAlpineMixin, MockBase):
    pass


class TestFormAlpineMixin(SimpleTestCase):
    """Media added to plain forms."""

    def test_media_includes_alpine_js(self):
        media_js = str(MockFormWithMixin().media)

        assert "django_form_alpine/js/alpine.js" in media_js
        assert 'src="/static/django_form_alpine/js/alpine.js"' in media_js
        if django.VERSION >= (5, 2):
            # Media's Script asset (the only way to get `defer` onto a
            # <script> tag here) was added in Django 5.2 - see the
            # django.forms import fallback in mixins.py.
            assert "defer" in media_js


class TestAdminAlpineMixin(SimpleTestCase):
    """Media added to admin classes."""

    def test_media_includes_alpine_and_admin_js(self):
        media_js = str(MockAdminWithMixin().media)

        assert "django_form_alpine/js/admin.js" in media_js
        assert "django_form_alpine/js/alpine.js" in media_js
        assert 'src="/static/django_form_alpine/js/admin.js"' in media_js
        if django.VERSION >= (5, 2):
            assert "defer" in media_js

    def test_media_preserves_base_media(self):
        assert "base.js" in str(MockAdminWithMixin().media)

    @override_settings(django_form_alpine_JS_PATH="custom/alpine.js")
    def test_custom_alpine_js_path(self):
        media_js = str(MockAdminWithMixin().media)

        assert "custom/alpine.js" in media_js
        assert "django_form_alpine/js/alpine.js" not in media_js


class TestUnfoldAdminAlpineMixin(SimpleTestCase):
    """Media added to Unfold admin classes."""

    def test_media_uses_unfolds_alpine(self):
        """Its preset and core.js are plain scripts placed before Unfold's
        deferred Alpine.js, and it adds no Alpine.js of its own."""
        media_js = str(MockUnfoldWithMixin().media)

        assert "base.js" in media_js
        assert "alpine.js" not in media_js
        assert "admin.js" not in media_js
        assert "defer" not in media_js
        assert media_js.index("django_form_alpine/js/contrib/unfold.js") < (
            media_js.index("django_form_alpine/js/core.js")
        )
