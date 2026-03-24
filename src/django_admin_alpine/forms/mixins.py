from django.forms import Media, Script


class AdminAlpineMixin:
    @property
    def media(self):
        return Media(
            js=(
                Script("django_admin_alpine/js/admin.js", defer=True),
                Script("django_admin_alpine/js/alpine.js", defer=True),
            ),
        )
