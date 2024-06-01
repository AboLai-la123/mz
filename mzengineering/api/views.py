
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from .serializers import LoginSerializer

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': '',
                'screen': 'mainScreen',  # اسم الشاشة الجديدة بعد تسجيل الدخول الناجح
                'screenManager': 'mainScreenManager'  # اسم مدير الشاشة (يمكن تعديله حسب احتياجاتك)
            }, status=status.HTTP_200_OK)
        return Response({
            'message': serializer.errors.get('non_field_errors', ['بيانات تسجيل الدخول غير صحيحة.'])[0],
            'screen': '',
            'screenManager': ''
        }, status=status.HTTP_200_OK)
