# x-add-model-data

Agrega `x-add-model-data` a un widget para que automáticamente:

1. Se registre el valor inicial del campo en el `form[x-data]` más cercano.
2. Se establezca `x-model="<clave>"` en el input para que Alpine lo mantenga sincronizado.

```python
class MyForm(forms.ModelForm):
    my_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-add-model-data": "myFieldState"
        })
    )
```

Tras ejecutarse `core.js`, el formulario tendrá:

```text
<form x-data='{"myFieldState": ""}'>
  <input x-model="myFieldState" ...>
</form>
```

## Valores iniciales

El valor inicial escrito en `x-data` depende del tipo de input:

| Tipo de input  | Valor inicial                          |
| -------------- | -------------------------------------- |
| `checkbox`     | `true` / `false` (booleano)            |
| `radio`        | `el.value` si está marcado, si no `""` |
| Cualquier otro | `el.value` (cadena de texto)           |

## Las claves existentes en x-data se preservan

Si el formulario ya tiene un atributo `x-data` con la clave, `x-add-model-data` no lo sobreescribe.

## Conflicto con x-model

Si un widget ya tiene un atributo `x-model` explícito, `x-add-model-data` se ignora y se muestra una advertencia en la consola.
