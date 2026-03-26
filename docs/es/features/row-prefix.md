# Formularios inline y **row_prefix**

Cuando se usan formularios inline de Django, cada fila es una instancia de formulario independiente. Usa el marcador `__row_prefix__` para espaciar las claves de estado de Alpine por fila, de modo que cada una gestione su propio estado de forma independiente.

## Uso

```python
class MyInlineForm(AdminAlpineMixin, forms.ModelForm):  # o FormAlpineMixin con resolvers propios
    my_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-add-model-data": "__row_prefix__myField",
            "x-field-box-show": "__row_prefix__otherField",
        })
    )
```

En tiempo de ejecución, `__row_prefix__` se reemplaza por un identificador único para cada fila, generando claves como `items_0_myField`, `items_1_myField`, etc.

## Orden de resolución

`__row_prefix__` se resuelve con la siguiente prioridad:

1. **ID del contenedor** — si el input está dentro de un elemento `tr.form-row` o `.inline-related`, se usa el `id` de ese elemento con los guiones reemplazados por guiones bajos.

   Ejemplo: id del contenedor `items-0` → prefijo `items_0` → `items_0_myField`.

2. **Atributo `name` del elemento** — si no se encuentra un contenedor, se parsea el `name` del input con el patrón `prefijo-número` (p.ej. `items-0`). El prefijo se usa tal cual, conservando el guión.

   Ejemplo: `name="items-0-my_field"` → prefijo `items-0` → `items-0_myField`.

3. **Cadena vacía** — si ninguna fuente coincide, `__row_prefix__` simplemente se elimina.

   Ejemplo: `__row_prefix__myField` → `myField`.

## Múltiples ocurrencias

Todas las ocurrencias de `__row_prefix__` en el valor de un atributo se reemplazan:

```python
attrs={
    "x-form-row-show": "__row_prefix__fieldA && __row_prefix__fieldB !== ''",
}
# → x-show="items_0_fieldA && items_0_fieldB !== ''"
```
