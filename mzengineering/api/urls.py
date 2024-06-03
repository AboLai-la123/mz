# myapp/urls.py

from django.urls import path
from . import views

app_name = "API"

urlpatterns = [
    path('login', views.LoginView.as_view(), name='login'),
    path('add-order', views.add_order, name="add-order"),
]
