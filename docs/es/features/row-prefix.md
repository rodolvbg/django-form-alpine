# Formularios inline y **row_prefix**

Cuando se usan formularios inline de Django, cada fila es una instancia de formulario independiente. Usa el marcador `__row_prefix__` para espaciar las claves de estado de Alpine por fila, de modo que cada una gestione su propio estado de forma independiente.

`__row_prefix__` sigue la convención de nombres de campos inline de Django: `<prefix>-<number>-<field>`.

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

En tiempo de ejecución, `__row_prefix__` se reemplaza con el identificador de fila de Django, generando claves como `items-0-myField`, `items-1-myField`, etc. — coincidiendo con los nombres que Django usa para los campos del formulario inline.

## Orden de resolución

1. **ID del contenedor** — si el input está dentro de un elemento `tr.form-row` o `.inline-related`, se usa el `id` de ese elemento tal cual.

   Ejemplo: id del contenedor `items-0` → `__row_prefix__myField` → `items-0-myField`.

2. **Atributo `name` del elemento** — si no se encuentra un contenedor, el `name` del input se parsea con el patrón `prefix-number` (p.ej. `items-0-title` → prefijo `items-0`).

   Ejemplo: `name="items-0-my_field"` → `__row_prefix__myField` → `items-0-myField`.

3. **Cadena vacía** — si ninguna fuente coincide, `__row_prefix__` simplemente se elimina.

   Ejemplo: `__row_prefix__myField` → `myField`.

## Múltiples ocurrencias

Todas las ocurrencias de `__row_prefix__` en el valor de un atributo se reemplazan:

```python
attrs={
    "x-form-row-show": "__row_prefix__fieldA && __row_prefix__fieldB !== ''",
}
# → x-show="items-0-fieldA && items-0-fieldB !== ''"
```
