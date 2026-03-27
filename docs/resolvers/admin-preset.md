# Django Admin preset resolvers

`AdminAlpineMixin` loads `admin.js`, which registers the following resolvers automatically. Each resolver maps a prefix to a target container in the Django Admin DOM.

## Reference

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
| `td`                 | Closest `td` (for tabular formset cells)                                            |

## Examples

### Show/hide a form row

```python
extra_field = forms.CharField(
    widget=forms.TextInput(attrs={
        "x-add-model-data": "showExtra",
        "x-form-row-show": "showExtra",
    })
)
```

### Toggle a fieldset

```python
some_field = forms.CharField(
    widget=forms.TextInput(attrs={
        "x-fieldset-class": "{'collapsed': !isOpen}",
    })
)
```

### React to errors

```python
some_field = forms.CharField(
    widget=forms.TextInput(attrs={
        "x-errorlist-show": "hasError",
    })
)
```

### Inline row visibility

```python
class MyInlineForm(AdminAlpineMixin, forms.ModelForm):
    active = forms.BooleanField(
        widget=forms.CheckboxInput(attrs={
            "x-add-model-data": "__row_prefix__active",
            "x-inline-container-show": "__row_prefix__active",
        })
    )
```
