# Configuración

## Ruta personalizada de Alpine.js

Por defecto la librería sirve su propio Alpine.js incluido. Para usar una versión diferente o una build alojada en CDN, establece `django_form_alpine_JS_PATH` en `settings.py`:

```python
# settings.py
django_form_alpine_JS_PATH = "path/to/your/custom-alpine.js"
```

La ruta se resuelve a través del sistema `staticfiles` de Django, por lo que debe ser relativa a la raíz de tus archivos estáticos.

### Ejemplo: usar una URL de CDN

```python
django_form_alpine_JS_PATH = "https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"
```

> **Nota:** Al usar una URL de CDN, asegúrate de que la URL sea de confianza en tu Content Security Policy.
