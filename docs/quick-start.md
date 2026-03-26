# Quick start

## Django Admin

Inherit from `AdminAlpineMixin` in your `ModelAdmin` or admin `Form`. The built-in resolvers are loaded automatically — no extra configuration needed.

```python
from django.contrib import admin
from django_form_alpine import AdminAlpineMixin
from .models import MyModel

@admin.register(MyModel)
class MyModelAdmin(AdminAlpineMixin, admin.ModelAdmin):
    pass
```

You can also apply it to an inline or a form class directly:

```python
from django import forms
from django_form_alpine import AdminAlpineMixin

class MyAdminForm(AdminAlpineMixin, forms.ModelForm):
    class Meta:
        model = MyModel
        fields = "__all__"
```

## Any Django form

Use `FormAlpineMixin` when you are outside of the admin or want to provide your own resolvers. See [Custom resolvers](resolvers/custom.md) for details on how to define them.

```python
from django import forms
from django_form_alpine import FormAlpineMixin

class MyForm(FormAlpineMixin, forms.ModelForm):
    class Meta:
        model = MyModel
        fields = "__all__"
```
