# x-add-model-data

Add `x-add-model-data` to a widget to automatically:

1. Register the field's initial value in the closest `form[x-data]`.
2. Set `x-model="<key>"` on the input so Alpine keeps it in sync.

```python
class MyForm(forms.ModelForm):
    my_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-add-model-data": "myFieldState"
        })
    )
```

After `core.js` runs, the form element will have:

```text
<form x-data='{"myFieldState": ""}'>
  <input x-model="myFieldState" ...>
</form>
```

## Initial values

The initial value written into `x-data` depends on the input type:

| Input type      | Initial value                         |
| --------------- | ------------------------------------- |
| `checkbox`      | `true` / `false` (boolean)            |
| `radio`         | `el.value` if checked, otherwise `""` |
| Everything else | `el.value` (string)                   |

## Existing x-data keys are preserved

If the form already has an `x-data` attribute with the key, `x-add-model-data` will not overwrite it:

```html
<!-- existing x-data -->
<form x-data='{"myFieldState": "initial"}'></form>
```

The value `"initial"` is kept as-is.

## Conflict with x-model

If a widget already has an explicit `x-model` attribute, `x-add-model-data` is ignored and a warning is logged to the console.
