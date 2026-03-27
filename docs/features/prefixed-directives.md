# Prefixed directives

Apply Alpine.js directives to surrounding containers directly from widget `attrs`, without writing any JavaScript or template code.

## Syntax

```
x-<resolver>-<directive>="<value>"
@<resolver>-<directive>="<expression>"
```

`core.js` reads these attributes and moves them to the element returned by the matching resolver.

## Example

```python
class MyForm(forms.ModelForm):
    toggle = forms.BooleanField(
        widget=forms.CheckboxInput(attrs={
            "x-add-model-data": "showExtra",
        })
    )
    extra_field = forms.CharField(
        widget=forms.TextInput(attrs={
            # applied to the closest .form-row as x-show="showExtra"
            "x-form-row-show": "showExtra",
        })
    )
```

## Value handling

| Widget attr value        | Applied as                                    |
| ------------------------ | --------------------------------------------- |
| Any non-empty string     | `x-<directive>="<value>"`                     |
| Empty string or `"true"` | `x-<directive>=""` (boolean Alpine attribute) |

## Event listeners with @

Use `@` instead of `x-` to apply Alpine event listeners:

```python
attrs={
    "@form-row-click": "doSomething()",
}
```

This sets `@click="doSomething()"` on the closest `.form-row`.

## Available resolvers

### Built-in resolvers

Always available regardless of which mixin or resolvers you use:

| Prefix | Target                   |
| ------ | ------------------------ |
| `self` | The input element itself |

Use `self` when you want to apply a directive directly to the input rather than a surrounding container — useful in formsets or anywhere no parent container is needed:

```python
my_field = forms.CharField(
    widget=forms.TextInput(attrs={
        "x-self-show": "isVisible",
    })
)
```

### Django Admin preset resolvers

See [Django Admin preset resolvers](../resolvers/admin-preset.md) for the full list, or [Custom resolvers](../resolvers/custom.md) to define your own.
