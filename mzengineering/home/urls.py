from django.urls import path
from . import views

app_name = "Home"
urlpatterns = [
    path("", views.home, name="home"),
    path("page1", views.home, name="page1"),
    path("page2", views.home, name="page2"),
]