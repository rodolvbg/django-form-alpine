# Resolvers personalizados

Usa `FormAlpineMixin` cuando quieras definir tus propios resolvers — por ejemplo, cuando trabajas fuera del Django Admin o cuando los contenedores predefinidos no coinciden con tu estructura HTML.

## Definir resolvers

Establece `window.DjangoFormAlpine.resolvers` en una etiqueta `<script>` **antes** de que carguen los scripts del formulario. Cada clave es el prefijo usado en los `attrs` del widget; el valor es una función que recibe el elemento input y devuelve el contenedor destino (o `null`).

```html
<script>
  window.DjangoFormAlpine = {
    resolvers: {
      "my-section": (el) => el.closest(".my-section"),
      "my-label": (el) => el.closest(".my-label"),
    },
  };
</script>
```

Luego usa esos prefijos en tu formulario:

```python
from django_form_alpine import FormAlpineMixin

class MyForm(FormAlpineMixin, forms.ModelForm):
    my_field = forms.CharField(
        widget=forms.TextInput(attrs={
            "x-add-model-data": "myFieldState",
            "x-my-section-show": "myFieldState !== ''",
        })
    )
```

## Combinar con el preset del admin

Si quieres resolvers personalizados **y** los del admin, establece `useAdminResolvers: true`. Los resolvers personalizados se fusionan encima — tus claves tienen prioridad sobre las predefinidas.

```html
<script>
  window.DjangoFormAlpine = {
    useAdminResolvers: true,
    resolvers: {
      "my-section": (el) => el.closest(".my-section"),
    },
  };
</script>
```

## Firma del resolver

```js
(el: HTMLElement) => HTMLElement | null
```

- `el` — el elemento input del formulario (`input`, `select` o `textarea`).
- Devuelve el contenedor destino, o `null` para omitir la aplicación de directivas de este resolver en este elemento.
