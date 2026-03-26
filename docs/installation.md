# Installation

## Install the package

```bash
pip install django-form-alpine
```

## Add to INSTALLED_APPS

```python
INSTALLED_APPS = [
    # ...
    "django_form_alpine",
    # ...
]
```

That's all that's needed. The library loads its scripts automatically via Django's media framework when you use one of the provided mixins.
