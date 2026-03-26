from django.conf import settings
from django.forms import Media, Script


class AdminAlpineMixin:
    @property
    def media(self):
        alpine_js_path = getattr(
            settings,
            "DJANGO_ADMIN_ALPINE_JS_PATH",
            "django_admin_alpine/js/alpine.js",
        )
        return super().media + Media(
            js=(
                Script("django_admin_alpine/js/admin.js", defer=True),
                Script("django_admin_alpine/js/core.js", defer=True),
                Script(alpine_js_path, defer=True),
            ),
        )
