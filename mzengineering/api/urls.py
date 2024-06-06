# myapp/urls.py

from django.urls import path
from . import views

app_name = "API"

urlpatterns = [
    path('login', views.LoginView.as_view(), name='login'),
    path('add-order', views.AddOrder, name="add-order"),
    path('add-user', views.AddUser, name="add-user"),
    path('edit-user', views.AddUser, name="edit-user"),
    path('delete', views.DeleteOrder, name="delete-order"),
    path('edit-password', views.EditPassword, name="edit-password"),
    path('logout', views.LogoutView),
]
