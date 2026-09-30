"""The demo's admin on an Unfold site (see ``example.settings_unfold``)."""

import copy

from unfold.admin import ModelAdmin, StackedInline, TabularInline
from unfold.sites import UnfoldAdminSite
from unfold.widgets import UnfoldAdminTextInputWidget, UnfoldBooleanWidget

from django_form_alpine.contrib.unfold import UnfoldAdminAlpineMixin

from . import admin as demo
from .forms import (
    ChildModelStackedFormBase,
    ChildModelTabularFormBase,
    ParentModelFormBase,
)
from .models import ParentModel

site = UnfoldAdminSite(name="admin")


def unfold_widgets(form_class, **widgets):
    """Unfold only styles its own widgets: give the form's declared fields
    Unfold's, keeping their Alpine attrs."""
    for name, widget_class in widgets.items():
        # A copy: the field object is shared with the Django admin's form.
        field = copy.deepcopy(form_class.declared_fields[name])
        field.widget = widget_class(attrs=field.widget.attrs)
        form_class.declared_fields[name] = form_class.base_fields[name] = field
    return form_class


class ParentModelForm(UnfoldAdminAlpineMixin, ParentModelFormBase):
    pass


class ChildModelTabularForm(UnfoldAdminAlpineMixin, ChildModelTabularFormBase):
    pass


class ChildModelStackedForm(UnfoldAdminAlpineMixin, ChildModelStackedFormBase):
    pass


unfold_widgets(ParentModelForm, extra_field=UnfoldAdminTextInputWidget)
unfold_widgets(ChildModelTabularForm, tabular_extra=UnfoldBooleanWidget)
unfold_widgets(ChildModelStackedForm, stacked_extra=UnfoldAdminTextInputWidget)


class ChildModelTabularInline(TabularInline):
    model = demo.ChildModelTabularInline.model
    form = ChildModelTabularForm
    extra = 1
    fieldsets = demo.ChildModelTabularInline.fieldsets


class ChildModelStackedInline(StackedInline):
    model = demo.ChildModelStackedInline.model
    form = ChildModelStackedForm
    extra = 1
    fieldsets = demo.ChildModelStackedInline.fieldsets


class ParentModelAdmin(ModelAdmin):
    form = ParentModelForm
    inlines = [ChildModelTabularInline, ChildModelStackedInline]
    fieldsets = demo.ParentModelAdmin.fieldsets


site.register(ParentModel, ParentModelAdmin)
