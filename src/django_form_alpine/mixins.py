from django.conf import settings
from django.forms import Media, Script


class FormAlpineMixin:
    """Mixin to add Alpine.js to form media."""

    @property
    def media(self):
        alpine_js_path = getattr(
            settings,
            "django_form_alpine_JS_PATH",
            "django_form_alpine/js/alpine.js",
        )
        return super().media + Media(
            js=(
                Script("django_form_alpine/js/core.js", defer=True),
                Script(alpine_js_path, defer=True),
            ),
        )


class AdminAlpineMixin(FormAlpineMixin):
    """
    Mixin to add admin.js and Alpine.js to admin media.
    """

    @property
    def media(self):
        admin_media = Media(js=[Script("django_form_alpine/js/admin.js", defer=True)])
        return admin_media + super().media
