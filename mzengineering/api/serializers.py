from django.contrib.auth import authenticate
from rest_framework import serializers
from home.models import Order, ObjectImage, AddressImage, ViolationImage

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


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['user','order_number','contractor','distract','order_type']
        error_messages = {
            'order_number': {'required': 'رقم الطلب مطلوب'},
            'contractor': {'required': 'اسم المقاول مطلوب'},
            'distract': {'required': 'المنطقة مطلوبة'},
            'order_type': {'required': 'نوع الطلب مطلوب', 'choices': 'يجب أن يكون عداد أو تنفيذ شبكة'},
        }

class ObjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectImage
        fields = '__all__'

class AddressImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddressImage
        fields = '__all__'

class ViolationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ViolationImage
        fields = '__all__'