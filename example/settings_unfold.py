"""The demo with django-unfold: ``DJANGO_SETTINGS_MODULE=settings_unfold``."""

from settings import *  # noqa: F403
from settings import INSTALLED_APPS

INSTALLED_APPS = ["unfold", *INSTALLED_APPS]

ROOT_URLCONF = "urls_unfold"
