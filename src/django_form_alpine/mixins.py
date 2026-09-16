from typing import TYPE_CHECKING

from django.conf import settings
from django.forms import Media

if TYPE_CHECKING:
    from django.forms import Script
else:
    try:
        # Script (a MediaAsset subclass letting a Media.js entry carry
        # extra <script> attributes like `defer`) was only added in
        # Django 5.2 — https://github.com/django/django/pull/18782.
        # Importing it unconditionally would break every older Django
        # this package otherwise supports.
        from django.forms import Script
    except ImportError:  # Django < 5.2
        Script = None


def _script(path, *, defer):
    """Build a Media.js entry for ``path``.

    Uses Django's ``Script`` asset (see above) to set ``defer`` when
    it's available; falls back to a plain path string otherwise — the
    script still loads, just without ``defer``, on Django < 5.2.
    """
    return Script(path, defer=defer) if Script is not None else path


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
        # Django (5.2+) also accepts MediaAsset instances like Script, which
        # is what's used here (when available) to get `defer=True` on the
        # <script> tag.
        return super().media + Media(  # type: ignore[misc]
            js=(
                _script("django_form_alpine/js/core.js", defer=True),
                _script(alpine_js_path, defer=True),
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
        admin_media = Media(js=[_script("django_form_alpine/js/admin.js", defer=True)])
        return admin_media + super().media
