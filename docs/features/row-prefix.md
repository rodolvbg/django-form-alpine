# Inline forms and **row_prefix**

When using Django inline forms, each row is an independent form instance. Use the `__row_prefix__` placeholder to namespace Alpine state keys per row so each row manages its own state independently.

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

At runtime, `__row_prefix__` is replaced with a unique identifier for each row, producing keys like `items_0_myField`, `items_1_myField`, etc.

## Resolution order

`__row_prefix__` is resolved using the following priority:

1. **Container ID** — if the input is inside a `tr.form-row` or `.inline-related` element, that element's `id` is used with dashes replaced by underscores.

   Example: container id `items-0` → prefix `items_0` → `items_0_myField`.

2. **Element `name` attribute** — if no container is found, the input's `name` is parsed with the pattern `prefix-number` (e.g. `items-0`). The prefix is used as-is, preserving the dash.

   Example: `name="items-0-my_field"` → prefix `items-0` → `items-0_myField`.

3. **Empty string** — if neither source matches, `__row_prefix__` is simply removed.

   Example: `__row_prefix__myField` → `myField`.

## Multiple occurrences

All occurrences of `__row_prefix__` in a single attribute value are replaced:

```python
attrs={
    "x-form-row-show": "__row_prefix__fieldA && __row_prefix__fieldB !== ''",
}
# → x-show="items_0_fieldA && items_0_fieldB !== ''"
```
