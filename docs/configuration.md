# Configuration

## Custom Alpine.js path

By default the library serves its own bundled Alpine.js: Alpine's [CSP build](https://alpinejs.dev/advanced/csp) (3.15), which evaluates directives without `eval`, so it works under a Content Security Policy without `'unsafe-eval'`. To use a different version or a CDN-hosted build, set `django_form_alpine_JS_PATH` in `settings.py`:

```python
# settings.py
django_form_alpine_JS_PATH = "path/to/your/custom-alpine.js"
```

The path is resolved via Django's `staticfiles` storage, so it should be relative to your static files root.

### Example: use a CDN URL

```python
django_form_alpine_JS_PATH = "https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"
```

> **Note:** When using a CDN URL, make sure the URL is trusted in your Content Security Policy. Alpine's standard build (`cdn.min.js` above) evaluates directives with `new Function`, so it also needs `'unsafe-eval'` in `script-src`; its CSP build (`@alpinejs/csp`) doesn't.
