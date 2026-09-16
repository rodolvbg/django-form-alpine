from django.conf import settings
from django.forms import Media
from django.templatetags.static import static
from django.utils.html import format_html


class _DeferredScript(str):
    """A static path that renders as ``<script src="..." defer></script>``.

    A plain ``str`` subclass so it works as a normal ``Media.js`` path on
    every supported Django version. Django >= 4.1 additionally calls
    ``__html__()`` on js entries that define it, which is how ``defer`` gets
    added; older Django ignores it and just renders a plain ``<script src>``
    tag without ``defer``.
    """

    def __html__(self) -> str:
        path = self if self.startswith(("http://", "https://", "/")) else static(self)
        return format_html('<script src="{}" defer></script>', path)


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
        return super().media + Media(  # type: ignore[misc]
            js=(
                _DeferredScript("django_form_alpine/js/core.js"),
                _DeferredScript(alpine_js_path),
            ),
        )


class AdminAlpineMixin(FormAlpineMixin):
    """
    Mixin to add admin.js and Alpine.js to admin media.
    """

    @property
    def media(self) -> Media:
        admin_media = Media(js=[_DeferredScript("django_form_alpine/js/admin.js")])
        return admin_media + super().media
