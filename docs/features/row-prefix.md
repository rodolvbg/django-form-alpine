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

At runtime, `__row_prefix__` is replaced with Django's row identifier, producing keys like `items-0-myField`, `items-1-myField`, etc. — matching the names Django uses for the inline form fields themselves.

## Resolution order

1. **Container ID** — if the input is inside a `tr.form-row` or `.inline-related` element, that element's `id` is used as-is.

   Example: container id `items-0` → `__row_prefix__myField` → `items-0-myField`.

2. **Element `name` attribute** — if no container is found, the input's `name` is parsed with the pattern `prefix-number` (e.g. `items-0-title` → prefix `items-0`).

   Example: `name="items-0-my_field"` → `__row_prefix__myField` → `items-0-myField`.

3. **Empty string** — if neither source matches, `__row_prefix__` is simply removed.

   Example: `__row_prefix__myField` → `myField`.

## Multiple occurrences

All occurrences of `__row_prefix__` in a single attribute value are replaced:

```python
attrs={
    "x-form-row-show": "__row_prefix__fieldA && __row_prefix__fieldB !== ''",
}
# → x-show="items-0-fieldA && items-0-fieldB !== ''"
```
