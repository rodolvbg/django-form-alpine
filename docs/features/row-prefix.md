# Inline forms and **row_prefix**

When using Django inline forms, each row is an independent form instance. Use the `__row_prefix__` placeholder to namespace Alpine state keys per row so each row manages its own state independently.

`__row_prefix__` follows Django's own inline field naming convention: `<prefix>-<number>-<field>`.

## Usage

```python
class MyInlineForm(AdminAlpineMixin, forms.ModelForm):  # or FormAlpineMixin with custom resolvers
    my_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-add-model-data": "__row_prefix__myField",
            "x-field-box-show": "__row_prefix__otherField",
        })
    )
```

At runtime, `__row_prefix__` is replaced with a sanitized version of Django's row identifier. Hyphens in the row ID are converted to underscores so the result is a valid JavaScript identifier for use with Alpine.js (e.g. `items_0_myField`, `items_1_myField`).

## Resolution order

1. **Container ID** — if the input is inside a `tr.form-row` or `.inline-related` element, that element's `id` is used, with hyphens replaced by underscores.

   Example: container id `items-0` → sanitized `items_0` → `__row_prefix__myField` → `items_0_myField`.

2. **Element `name` attribute** — if no container is found, the input's `name` is parsed with the pattern `prefix-number` (e.g. `items-0-title` → prefix `items-0`), then sanitized.

   Example: `name="items-0-my_field"` → `__row_prefix__myField` → `items_0_myField`.

3. **Empty string** — if neither source matches, `__row_prefix__` is simply removed.

   Example: `__row_prefix__myField` → `myField`.

## Empty form templates

Django includes an empty form template row (with `__prefix__` in field names and IDs) for dynamically adding new inline rows. Elements containing `__prefix__` are automatically skipped and never processed by `core.js`.

## Multiple occurrences

All occurrences of `__row_prefix__` in a single attribute value are replaced:

```python
attrs={
    "x-form-row-show": "__row_prefix__fieldA && __row_prefix__fieldB !== ''",
}
# → x-show="items_0_fieldA && items_0_fieldB !== ''"
```
