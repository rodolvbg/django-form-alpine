# Directivas con prefijo

Aplica directivas Alpine.js a contenedores circundantes directamente desde los `attrs` del widget, sin escribir JavaScript ni plantillas.

## Sintaxis

```
x-<resolver>-<directiva>="<valor>"
@<resolver>-<directiva>="<expresión>"
```

`core.js` lee estos atributos y los mueve al elemento que devuelve el resolver correspondiente.

## Ejemplo

```python
class MyForm(forms.ModelForm):
    toggle = forms.BooleanField(
        widget=forms.CheckboxInput(attrs={
            "x-add-model-data": "showExtra",
        })
    )
    extra_field = forms.CharField(
        widget=forms.TextInput(attrs={
            # se aplica al .form-row más cercano como x-show="showExtra"
            "x-form-row-show": "showExtra",
        })
    )
```

## Manejo de valores

| Valor del attr en el widget | Se aplica como                                |
| --------------------------- | --------------------------------------------- |
| Cualquier cadena no vacía   | `x-<directiva>="<valor>"`                     |
| Cadena vacía o `"true"`     | `x-<directiva>=""` (atributo booleano Alpine) |

## Event listeners con @

Usa `@` en lugar de `x-` para aplicar listeners de eventos Alpine:

```python
attrs={
    "@form-row-click": "doSomething()",
}
```

Esto establece `@click="doSomething()"` en el `.form-row` más cercano.

## Resolvers disponibles

### Resolvers integrados

Siempre disponibles independientemente del mixin o resolvers que uses:

| Prefijo | Objetivo                 |
| ------- | ------------------------ |
| `self`  | El propio elemento input |

Usa `self` cuando quieras aplicar una directiva directamente al input en lugar de a un contenedor circundante — útil en formsets o donde no se necesita un contenedor padre:

```python
my_field = forms.CharField(
    widget=forms.TextInput(attrs={
        "x-self-show": "isVisible",
    })
)
```

### Resolvers del preset de Admin de Django

Consulta [Resolvers del preset de Admin](../resolvers/admin-preset.md) para la lista completa, o [Resolvers personalizados](../resolvers/custom.md) para definir los tuyos.
