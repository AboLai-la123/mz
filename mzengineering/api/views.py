
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from .serializers import LoginSerializer
from django.http import HttpResponseBadRequest

from rest_framework.decorators import api_view
from home.models import Order, ObjectImage, AddressImage, ViolationImage
from .serializers import OrderSerializer, ObjectImageSerializer, AddressImageSerializer, ViolationImageSerializer


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


@api_view(['POST'])
def add_order(request):
    if request.user.is_authenticated:
        order_data = request.data
        order_data['user'] = request.user.pk

        order_serializer = OrderSerializer(data=order_data)
        if order_serializer.is_valid():
            order = order_serializer.save()

            # معالجة وحفظ صور الأشياء (Objects)
            objects_images_data = [(key, value) for key, value in order_data.items() if key.startswith('objectImage')]
            for index, (key, value) in enumerate(objects_images_data, start=1):
                image_data = {'order': order.id, 'image': value}
                image_serializer = ObjectImageSerializer(data=image_data)
                if image_serializer.is_valid():
                    image_serializer.save()
                else:
                    print("1")
                    return Response(image_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # معالجة وحفظ صور العناوين (Addresses)
            addresses_images_data = [(key, value) for key, value in order_data.items() if key.startswith('addressImage')]
            for index, (key, value) in enumerate(addresses_images_data, start=1):
                image_data = {'order': order.id, 'image': value, 'latitude': order_data[key.replace('addressImage', 'addressLatitude')], 'longitude': order_data[key.replace('addressImage', 'addressLongitude')]}
                image_serializer = AddressImageSerializer(data=image_data)
                if image_serializer.is_valid():
                    image_serializer.save()
                else:
                    print("2")
                    return Response(image_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # معالجة وحفظ صور المخالفات (Violations)
            violations_images_data = [(key, value) for key, value in order_data.items() if key.startswith('violationImage')]
            for index, (key, value) in enumerate(violations_images_data, start=1):
                image_data = {'order': order.id, 'image': value, 'latitude': order_data[key.replace('violationImage', 'violationLatitude')], 'longitude': order_data[key.replace('violationImage', 'violationLongitude')]}
                image_serializer = ViolationImageSerializer(data=image_data)
                if image_serializer.is_valid():
                    image_serializer.save()
                else:
                    print("3")
                    return Response(image_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({'message': 'Order uploaded successfully'}, status=status.HTTP_201_CREATED)
        else:
            print("4")
            return Response(order_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return HttpResponseBadRequest("يجب تسجيل الدخول للوصول إلى هذا المحتوى.", status=401)