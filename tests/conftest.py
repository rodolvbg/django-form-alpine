import os

import pytest
from django.contrib.auth.models import User

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tests.settings")
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"


@pytest.fixture(scope="session")
def django_db_setup(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        User.objects.create_superuser("admin", "admin@example.com", "password")
