from django import forms

from django_form_alpine import AdminAlpineMixin

from .models import ChildModelStacked, ChildModelTabular, ParentModel


class ParentModelFormBase(forms.ModelForm):
    extra_field = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                "x-add-model-data": "extraFieldState",
                "x-form-row-show": 'extraFieldState != "secret"',
            }
        ),
    )

    class Meta:
        model = ParentModel
        fields = ["name", "description"]


class ChildModelTabularFormBase(forms.ModelForm):
    tabular_extra = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(
            attrs={
                "x-add-model-data": "__row_prefix__tabular_extra",
            }
        ),
    )

    class Meta:
        model = ChildModelTabular
        fields = ["parent", "title", "quantity"]


class ChildModelStackedFormBase(forms.ModelForm):
    stacked_extra = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                "x-add-model-data": "__row_prefix__stacked_extra",
                "x-field-box-show": "!__row_prefix__stacked_extra",
            }
        ),
    )

    class Meta:
        model = ChildModelStacked
        fields = ["parent", "note", "is_important"]


# The directives above, on Django's admin (see admin_unfold.py for Unfold's).


class ParentModelForm(AdminAlpineMixin, ParentModelFormBase):
    pass


class ChildModelTabularForm(AdminAlpineMixin, ChildModelTabularFormBase):
    pass


class ChildModelStackedForm(AdminAlpineMixin, ChildModelStackedFormBase):
    pass
