from django.urls import path
from . import views

app_name = "Home"
urlpatterns = [
    path("", views.home, name="home"),
    path("<page_name>", views.home, name="home"),
    path("export/<int:order_pk>", views.export_order_as_pdf, name="export_order_as_pdf"),
]