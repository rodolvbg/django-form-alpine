from django.conf import settings
from django.forms import Media, Script


class FormAlpineMixin:
    """Mixin to add Alpine.js to form media.

    A bare mixin: meant to sit alongside a Django form/widget base class
    (e.g. ``class MyForm(FormAlpineMixin, forms.Form)``) that supplies the
    real ``media`` property this augments via ``super()``. mypy can't see
    that base class until the two are combined in a using class, hence the
    scoped ``# type: ignore[misc]`` below.
    """

    @property
    def media(self) -> Media:
        alpine_js_path = getattr(
            settings,
            "django_form_alpine_JS_PATH",
            "django_form_alpine/js/alpine.js",
        )
        # django-stubs types Media(js=...) as Sequence[str] | None, but real
        # Django (4.1+) also accepts MediaAsset instances like Script, which
        # is what's used here to get `defer=True` on the <script> tag.
        return super().media + Media(  # type: ignore[misc]
            js=(  # type: ignore[arg-type]
                Script("django_form_alpine/js/core.js", defer=True),
                Script(alpine_js_path, defer=True),
            ),
        )


class AdminAlpineMixin(FormAlpineMixin):
    """
    Mixin to add admin.js and Alpine.js to admin media.
    """

    @property
    def media(self) -> Media:
        # See the type: ignore note on FormAlpineMixin.media above: Media(js=...)
        # is stubbed as Sequence[str] | None but Script instances are valid too.
        admin_media = Media(
            js=[Script("django_form_alpine/js/admin.js", defer=True)]  # type: ignore[list-item]
        )
        return admin_media + super().media
