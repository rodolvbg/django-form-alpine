from django import forms


class AdminAlpineFormMixin:
    @property
    def media(self):
        return super().media + forms.Media(js=("django_admin_alpine/alpine.js",))
