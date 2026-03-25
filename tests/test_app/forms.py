from django import forms

from django_admin_alpine import AdminAlpineMixin

from .models import ChildModelStacked, ChildModelTabular, ParentModel


class ParentModelForm(AdminAlpineMixin, forms.ModelForm):
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
        fields = "__all__"


class ChildModelTabularForm(AdminAlpineMixin, forms.ModelForm):
    tabular_extra = forms.BooleanField(
        required=False,
        widget=forms.CheckboxInput(
            attrs={
                "x-add-model-data": "__inline_prefix__tabular_extra",
            }
        ),
    )

    class Meta:
        model = ChildModelTabular
        fields = "__all__"


class ChildModelStackedForm(AdminAlpineMixin, forms.ModelForm):
    stacked_extra = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                "x-add-model-data": "__inline_prefix__stacked_extra",
                "x-field-box-show": "!__inline_prefix__stacked_extra",
            }
        ),
    )

    class Meta:
        model = ChildModelStacked
        fields = "__all__"
