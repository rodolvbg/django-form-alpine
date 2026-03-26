# django-form-alpine

`django-form-alpine` integrates [Alpine.js](https://alpinejs.dev/) into Django forms declaratively — you write Alpine directives directly in your widget `attrs`, and the library resolves which surrounding DOM element each directive should land on.

A **Django Admin preset** is included out of the box, so you get zero-config support for all standard admin containers. You can also define your own resolvers to use the library in any Django form, outside of the admin.

```{toctree}
:maxdepth: 2
:caption: Getting started

installation
how-it-works
quick-start
```

```{toctree}
:maxdepth: 2
:caption: Features

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
:caption: Reference

configuration
changelog
contributing
```
