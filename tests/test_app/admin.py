from django.contrib import admin

from django_admin_alpine import AdminAlpineMixin

from .forms import ChildModelStackedForm, ChildModelTabularForm, ParentModelForm
from .models import ChildModelStacked, ChildModelTabular, ParentModel


class ChildModelTabularInline(AdminAlpineMixin, admin.TabularInline):
    model = ChildModelTabular
    form = ChildModelTabularForm
    extra = 1
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "quantity",
                    "tabular_extra",
                ),
            },
        ),
    )


class ChildModelStackedInline(AdminAlpineMixin, admin.StackedInline):
    model = ChildModelStacked
    form = ChildModelStackedForm
    extra = 1
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "note",
                    "is_important",
                    "stacked_extra",
                ),
            },
        ),
    )


@admin.register(ParentModel)
class ParentModelAdmin(AdminAlpineMixin, admin.ModelAdmin):
    form = ParentModelForm
    inlines = [ChildModelTabularInline, ChildModelStackedInline]
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "description",
                    "extra_field",
                ),
            },
        ),
    )
