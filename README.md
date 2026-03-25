# django-admin-alpine

`django-admin-alpine` is a Django library that facilitates the integration of [Alpine.js](https://alpinejs.dev/) into your Django Admin forms. It provides a simple way to synchronize form states and apply Alpine.js directives to various administrative elements.

## Installation

You can install `django-admin-alpine` using `pip`:

```bash
pip install django-admin-alpine
```

Add `django_admin_alpine` to your `INSTALLED_APPS` in `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    "django_admin_alpine",
    # ...
]
```

## Configuration

By default, the library includes its own Alpine.js bundle. However, you can use a custom version or a specific path by adding the following setting:

```python
# settings.py
DJANGO_ADMIN_ALPINE_JS_PATH = "path/to/your/custom-alpine.js"
```

## Usage

To use Alpine.js features in your Django Admin forms, simply inherit from `AdminAlpineMixin` in your `ModelAdmin` or `Form`.

### Using the Mixin in ModelAdmin

```python
from django.contrib import admin
from django_admin_alpine import AdminAlpineMixin
from .models import MyModel

@admin.register(MyModel)
class MyModelAdmin(AdminAlpineMixin, admin.ModelAdmin):
    # Your ModelAdmin configuration
    pass
```

### Using the Mixin in Forms

```python
from django import forms
from django_admin_alpine import AdminAlpineMixin

class MyForm(AdminAlpineMixin, forms.ModelForm):
    # Your Form configuration
    # This ensures that Alpine.js and the helper script are included in the form's media
    pass
```

## Features

### Synchronizing State with `x-add-model-data`

You can automatically add an input's value to the form's Alpine.js `x-data` state by adding the `x-add-model-data` attribute:

```python
# In your Form
class MyForm(forms.ModelForm):
    my_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-add-model-data": "myFieldState"
        })
    )
```

This will initialize `myFieldState` in the form's `x-data` and sync it with the input using `x-model`.

### Prefixed Attributes for Targeted Directives

`django-admin-alpine` allows you to apply Alpine.js directives directly from your Django widgets to surrounding containers (form rows, fieldsets, field boxes, labels, etc.) using special prefixes:

- `x-form-row-*` or `@form-row-*`: Applies `x-*` or `@*` to the closest `.form-row`.
- `x-fieldset-*` or `@fieldset-*`: Applies to the closest `fieldset`.
- `x-field-box-*` or `@field-box-*`: Applies to the `.field-box` container.
- `x-label-*` or `@label-*`: Applies to the field's `label`.
- `x-errorlist-*` or `@errorlist-*`: Applies to the error list container.
- `x-help-*` or `@help-*`: Applies to the help text container.
- `x-inline-container-*` or `@inline-container-*`: Applies to the inline container (`.inline-related` or `tr.form-row`).
- `x-nonfield-errorlist-*` or `@nonfield-errorlist-*`: Applies to non-field error list containers in inlines.
- `x-option-label-*` or `@option-label-*`: Applies to the closest `label` of the element (useful for radio or checkbox labels).

#### Example: Show/Hide a form row based on another field

```python
# In your Form
class MyForm(forms.ModelForm):
    toggle = forms.BooleanField(
        widget=forms.CheckboxInput(attrs={
            "x-add-model-data": "showExtraField"
        })
    )
    extra_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-form-row-show": "showExtraField"
        })
    )
```

### Handling Inlines with `__inline_prefix__`

When working with Django's inline forms, you can use the `__inline_prefix__` placeholder to correctly target fields within the same inline instance:

```python
"x-add-model-data": "__inline_prefix__myField"
```

The script will automatically replace `__inline_prefix__` with the unique ID of the inline container.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
