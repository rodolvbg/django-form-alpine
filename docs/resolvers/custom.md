# Custom resolvers

Use `FormAlpineMixin` when you want to define your own resolvers — for example, when working outside of Django Admin or when the built-in containers don't match your HTML structure.

## Defining resolvers

Set `window.DjangoFormAlpine.resolvers` in a `<script>` tag **before** the form's scripts load. Each key is the prefix used in widget `attrs`; the value is a function that receives the input element and returns the target container (or `null`).

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

Then use those prefixes in your form:

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

## Combining with the admin preset

If you want custom resolvers **and** the built-in admin ones, set `useAdminResolvers: true`. Custom resolvers are merged on top — your keys win over the defaults.

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

In this case you can use `AdminAlpineMixin` (which loads `admin.js`) or `FormAlpineMixin` with `admin.js` included separately.

## Resolver signature

```js
(el: HTMLElement) => HTMLElement | null
```

- `el` — the form input element (`input`, `select`, or `textarea`).
- Return the target container, or `null` to skip applying directives for this resolver on this element.
