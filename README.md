# django-form-alpine

`django-form-alpine` integrates [Alpine.js](https://alpinejs.dev/) into Django forms declaratively — you write Alpine directives directly in your widget `attrs`, and the library resolves which surrounding DOM element each directive should land on.

A **Django Admin preset** is included out of the box, so you get zero-config support for all standard admin containers. You can also define your own resolvers to use the library in any Django form, outside of the admin.

## Installation

```bash
pip install django-form-alpine
```

Add `django_form_alpine` to `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    # ...
    "django_form_alpine",
    # ...
]
```

## How it works

The library has two layers:

- **`core.js`** — the engine. On `DOMContentLoaded` it reads `window.DjangoFormAlpine.resolvers`, iterates over all form inputs, and for each resolver it applies any matching prefixed attributes to the resolved container.
- **`admin.js`** — the Django Admin preset. Registers built-in resolvers for all standard admin containers (`.form-row`, `fieldset`, `.field-box`, `.inline-related`, etc.) into `window.DjangoFormAlpine` unless you supply your own.

Two mixins are provided:

| Mixin              | Loads                                | Use when                                   |
| ------------------ | ------------------------------------ | ------------------------------------------ |
| `FormAlpineMixin`  | `core.js` + `alpine.js`              | Any Django form with custom resolvers      |
| `AdminAlpineMixin` | `admin.js` + `core.js` + `alpine.js` | Django Admin (built-in resolvers included) |

## Quick start

### Django Admin

Inherit from `AdminAlpineMixin` in your `ModelAdmin` or admin `Form`:

```python
from django.contrib import admin
from django_form_alpine import AdminAlpineMixin
from .models import MyModel

@admin.register(MyModel)
class MyModelAdmin(AdminAlpineMixin, admin.ModelAdmin):
    pass
```

That's it — the admin preset resolvers are loaded automatically.

### Any Django form

Use `FormAlpineMixin` and define your own resolvers (see [Custom resolvers](#custom-resolvers)):

```python
from django import forms
from django_form_alpine import FormAlpineMixin

class MyForm(FormAlpineMixin, forms.ModelForm):
    class Meta:
        model = MyModel
        fields = "__all__"
```

## Features

### Synchronize state with `x-add-model-data`

Add `x-add-model-data` to a widget to automatically register the field in the form's `x-data` and bind it with `x-model`:

```python
class MyForm(forms.ModelForm):
    my_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-add-model-data": "myFieldState"
        })
    )
```

This initializes `myFieldState` in the closest `form[x-data]` and sets `x-model="myFieldState"` on the input.

### Prefixed directives

Apply Alpine.js directives to surrounding containers directly from widget `attrs` using the `x-<resolver>-<directive>` (or `@<resolver>-<directive>`) pattern.

#### Django Admin preset resolvers

| Prefix               | Target container                                                                    |
| -------------------- | ----------------------------------------------------------------------------------- |
| `form-row`           | Closest `.form-row`                                                                 |
| `form-multiline`     | Closest `.form-multiline`                                                           |
| `form`               | Closest `form`                                                                      |
| `fieldset`           | Closest `fieldset`                                                                  |
| `field-box`          | Closest `.field-box` (falls back to `label.parentElement`, then `el.parentElement`) |
| `field-container`    | Parent of the field box                                                             |
| `label`              | Field's `label` (inside `.flex-container` or `.form-row`)                           |
| `errorlist`          | `.errorlist` inside the field container                                             |
| `help`               | `.help` inside the field container                                                  |
| `inline-container`   | `tr.form-row` or `.inline-related`                                                  |
| `nonfield-errorlist` | `.errorlist.nonfield` in tabular or stacked inlines                                 |
| `option-label`       | Closest `label` (for checkboxes and radios)                                         |

#### Example: show/hide a form row

```python
class MyForm(forms.ModelForm):
    toggle = forms.BooleanField(
        widget=forms.CheckboxInput(attrs={
            "x-add-model-data": "showExtra"
        })
    )
    extra_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-form-row-show": "showExtra"
        })
    )
```

### Inline forms with `__row_prefix__`

Use `__row_prefix__` to namespace Alpine state keys per inline row, so each row has its own independent state:

```python
class MyInlineForm(AdminAlpineMixin, forms.ModelForm):  # or FormAlpineMixin with custom resolvers
    my_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-add-model-data": "__row_prefix__myField",
            "x-field-box-show": "__row_prefix__otherField",
        })
    )
```

`__row_prefix__` is resolved at runtime in this order:

1. **Container ID** — ID of the closest `tr.form-row` or `.inline-related`, with dashes replaced by underscores (e.g. `items_0`). So `__row_prefix__myField` → `items_0_myField`.
2. **Element `name`** — parsed with a `prefix-number` pattern (e.g. `items-0`). The prefix is used as-is, preserving the dash.
3. **Empty string** — `__row_prefix__` is simply removed if neither applies.

## Custom resolvers

Use `FormAlpineMixin` and define your resolvers in a `<script>` tag **before** the form's scripts load:

```html
<script>
  window.DjangoFormAlpine = {
    resolvers: {
      "my-section": (el) => el.closest(".my-section"),
      "my-label": (el) => el.closest(".my-label"),
    },
  };
</script>
```

Each resolver is a function `(el) => HTMLElement | null` where `el` is the form input element.

When you provide your own resolvers, the admin preset is **not** loaded. If you want both, set `useAdminResolvers: true`:

```html
<script>
  window.DjangoFormAlpine = {
    useAdminResolvers: true,
    resolvers: {
      // Your custom resolver — merged on top of the admin ones
      "my-section": (el) => el.closest(".my-section"),
    },
  };
</script>
```

## Configuration

To use a custom Alpine.js bundle instead of the one included with the package:

```python
# settings.py
django_form_alpine_JS_PATH = "path/to/your/custom-alpine.js"
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
