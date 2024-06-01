# myapp/urls.py

from django.urls import path
from .views import LoginView

app_name = "API"

urlpatterns = [
    path('login', LoginView.as_view(), name='login'),
]
