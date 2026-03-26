# django-form-alpine

`django-form-alpine` integra [Alpine.js](https://alpinejs.dev/) en formularios de Django de forma declarativa — escribes las directivas Alpine directamente en los `attrs` del widget, y la librería resuelve a qué elemento del DOM circundante debe aplicarse cada directiva.

Se incluye un **preset para Django Admin** listo para usar, con soporte sin configuración para todos los contenedores estándar del admin. También puedes definir tus propios resolvers para usar la librería en cualquier formulario Django, fuera del admin.

```{toctree}
:maxdepth: 2
:caption: Primeros pasos

installation
how-it-works
quick-start
```

```{toctree}
:maxdepth: 2
:caption: Funcionalidades

features/x-add-model-data
features/prefixed-directives
features/row-prefix
```

```{toctree}
:maxdepth: 2
:caption: Resolvers

resolvers/admin-preset
resolvers/custom
```

```{toctree}
:maxdepth: 1
:caption: Referencia

configuration
changelog
contributing
```
