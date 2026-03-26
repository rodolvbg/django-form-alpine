# Inicio rápido

## Django Admin

Hereda de `AdminAlpineMixin` en tu `ModelAdmin` o `Form` de admin. Los resolvers predefinidos se cargan automáticamente.

```python
from django.contrib import admin
from django_form_alpine import AdminAlpineMixin
from .models import MyModel

@admin.register(MyModel)
class MyModelAdmin(AdminAlpineMixin, admin.ModelAdmin):
    pass
```

También puedes aplicarlo a un inline o directamente a una clase de formulario:

```python
from django import forms
from django_form_alpine import AdminAlpineMixin

class MyAdminForm(AdminAlpineMixin, forms.ModelForm):
    class Meta:
        model = MyModel
        fields = "__all__"
```

## Cualquier formulario Django

Usa `FormAlpineMixin` cuando estés fuera del admin o quieras definir tus propios resolvers. Consulta [Resolvers personalizados](resolvers/custom.md) para más detalles.

```python
from django import forms
from django_form_alpine import FormAlpineMixin

class MyForm(FormAlpineMixin, forms.ModelForm):
    class Meta:
        model = MyModel
        fields = "__all__"
```
