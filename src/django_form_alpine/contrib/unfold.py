"""django-unfold integration."""

from django.forms import Media


class UnfoldAdminAlpineMixin:
    """``AdminAlpineMixin`` for django-unfold's admin, which already loads
    Alpine.js: uses Unfold's instead of loading a second one, with resolvers
    for Unfold's markup (the admin preset's names)::

        from unfold.admin import ModelAdmin

        class ParentModelAdmin(UnfoldAdminAlpineMixin, ModelAdmin):
            form = ParentModelForm

    The scripts are plain (not deferred), so ``core.js`` runs before Unfold's
    deferred Alpine.js and applies the directives on ``alpine:init``.
    """

    @property
    def media(self) -> Media:
        return super().media + Media(  # type: ignore[misc]
            js=(
                "django_form_alpine/js/contrib/unfold.js",
                "django_form_alpine/js/core.js",
            ),
        )


__all__ = ["UnfoldAdminAlpineMixin"]
