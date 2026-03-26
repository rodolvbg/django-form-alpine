# Resolvers del preset de Admin

`AdminAlpineMixin` carga `admin.js`, que registra automáticamente los siguientes resolvers. Cada resolver mapea un prefijo a un contenedor en el DOM del Django Admin.

## Referencia

| Prefijo              | Contenedor destino                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `form-row`           | `.form-row` más cercano                                                                    |
| `form-multiline`     | `.form-multiline` más cercano                                                              |
| `form`               | `form` más cercano                                                                         |
| `fieldset`           | `fieldset` más cercano                                                                     |
| `field-box`          | `.field-box` más cercano (con fallback a `label.parentElement` y luego `el.parentElement`) |
| `field-container`    | Padre del field box                                                                        |
| `label`              | `label` del campo (dentro de `.flex-container` o `.form-row`)                              |
| `errorlist`          | `.errorlist` dentro del field container                                                    |
| `help`               | `.help` dentro del field container                                                         |
| `inline-container`   | `tr.form-row` o `.inline-related`                                                          |
| `nonfield-errorlist` | `.errorlist.nonfield` en inlines tabulares o apilados                                      |
| `option-label`       | `label` más cercano (para checkboxes y radios)                                             |

## Ejemplos

### Mostrar/ocultar una fila del formulario

```python
extra_field = forms.CharField(
    widget=forms.TextInput(attrs={
        "x-add-model-data": "showExtra",
        "x-form-row-show": "showExtra",
    })
)
```

### Alternar un fieldset

```python
some_field = forms.CharField(
    widget=forms.TextInput(attrs={
        "x-fieldset-class": "{'collapsed': !isOpen}",
    })
)
```

### Reaccionar a errores

```python
some_field = forms.CharField(
    widget=forms.TextInput(attrs={
        "x-errorlist-show": "hasError",
    })
)
```

### Visibilidad de fila en inline

```python
class MyInlineForm(AdminAlpineMixin, forms.ModelForm):
    active = forms.BooleanField(
        widget=forms.CheckboxInput(attrs={
            "x-add-model-data": "__row_prefix__active",
            "x-inline-container-show": "__row_prefix__active",
        })
    )
```
