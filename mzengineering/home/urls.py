from django.urls import path
from . import views

app_name = "Home"
urlpatterns = [
    path("", views.home, name="home"),
    path("<page_name>", views.home, name="home"),
]