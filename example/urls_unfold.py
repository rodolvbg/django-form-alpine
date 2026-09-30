from catalog.admin_unfold import site
from django.urls import path

urlpatterns = [
    path("admin/", site.urls),
]
