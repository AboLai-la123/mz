from django.contrib.auth import authenticate
from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    jobNumber = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        jobNumber = data.get('jobNumber')
        password = data.get('password')

        if jobNumber and password:
            user = authenticate(username=jobNumber, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('الحساب غير مفعل.')
                data['user'] = user
            else:
                raise serializers.ValidationError('بيانات تسجيل الدخول غير صحيحة.')
        else:
            raise serializers.ValidationError('يجب إدخال الرقم الوظيفي وكلمة المرور.')

        return data