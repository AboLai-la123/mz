from django.shortcuts import redirect, render, get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseBadRequest, JsonResponse
from django.contrib.auth.models import User

from rest_framework.decorators import api_view
from home.models import Order, ObjectImage, AddressImage, ViolationImage
from .serializers import ObjectImageSerializer, AddressImageSerializer, ViolationImageSerializer, LoginSerializer
from django.views.decorators.csrf import csrf_exempt
import re

def check_password(password):
    # التحقق من طول كلمة المرور
    if len(password) < 8:
        return "كلمة المرور ضعيفة: يجب أن تكون على الأقل 8 أحرف."
    
    # التحقق من وجود حرف كبير
    if not re.search(r'[A-Z]', password):
        return "كلمة المرور ضعيفة: يجب أن تحتوي على حرف كبير واحد على الأقل."
    
    # التحقق من وجود حرف صغير
    if not re.search(r'[a-z]', password):
        return "كلمة المرور ضعيفة: يجب أن تحتوي على حرف صغير واحد على الأقل."
    
    # التحقق من وجود رقم
    if not re.search(r'\d', password):
        return "كلمة المرور ضعيفة: يجب أن تحتوي على رقم واحد على الأقل."
    
    # التحقق من وجود رمز خاص
    if not re.search(r'[@$!%*?&]', password):
        return "كلمة المرور ضعيفة: يجب أن تحتوي على رمز خاص واحد على الأقل."
    
    return None

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': '',
                'screen': 'mainScreen',
                'screenManager': 'mainScreenManager'
            }, status=status.HTTP_200_OK)
        
        # استخدم الرسالة الأولى فقط
        message = None
        for field_errors in serializer.errors.values():
            if isinstance(field_errors, list) and field_errors:
                message = field_errors[0]
                break
        
        return Response({
            'message': message or 'بيانات تسجيل الدخول غير صحيحة.',
            'screen': '',
            'screenManager': ''
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
def LogoutView(request):
    logout(request)
    return redirect("/")

@api_view(['POST'])
def EditPassword(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "يجب تسجيل الدخول للوصول إلى هذا المحتوى."}, status=401)
    oldPassword = request.data.get("oldPassword")
    newPassword = request.data.get("newPassword")

    message = None

    if not oldPassword:
        message = 'كلمة المرور مطلوبة'
    else:
        userPasswordFilter = authenticate(username=request.user.username,password=oldPassword)
        if userPasswordFilter == None:
            message = 'كلمة المرور غير صحيحة'

    if not message and not newPassword:
        message = message or 'كلمة المرور الجديدة مطلوبة'
    elif len(oldPassword) > 100:
        message = message or 'كلمة المرور الجديدة يجب ألا تتجاوز 100 حرفًا'
    else:
        message = message or check_password(request.data.get("newPassword"))
    
    
    if message:
        return JsonResponse({"message": message}, status=400)
    
    user_get = User.objects.get(pk=request.user.pk)
    user_get.set_password(request.data.get("newPassword"))
    user_get.save()

    return JsonResponse({'screen': 'logout'}, status=201)


@api_view(['POST'])
def AddUser(request):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({"message": "يجب تسجيل الدخول للوصول إلى هذا المحتوى."}, status=401)

    user_data = request.data
    if user_data["userPK"] != "":
        user_get = User.objects.get(pk=int(user_data["userPK"]))

    message = None

    job_number = user_data.get('job_number')
    first_name = user_data.get('first_name')
    last_name  = user_data.get('last_name')
    userPassword   = user_data.get('userPassword')

    if not job_number:
        message = message or 'الرقم الوظيفي مطلوب'
    elif len(job_number) > 50:
        message = message or 'رقم الوظيفي يجب ألا يتجاوز 50 حرفًا'
    if user_data["userPK"] != "":
        if user_get.username != job_number:
            if User.objects.filter(username=job_number).exists():
                message = message or 'الرقم الوظيفي يجب أن يكون فريدًا'
    elif User.objects.filter(username=job_number).exists():
        message = message or 'الرقم الوظيفي يجب أن يكون فريدًا'

    if not message and firstName.strip() == "":
        message = message or 'الإسم الأول مطلوب'
    elif not message and len(first_name) > 100:
        message = message or 'الإسم الأول يجب ألا يتجاوز 100 حرفًا'

    if not message and lastName.strip() == "":
        message = message or 'الإسم الأخير مطلوب'
    elif not message and len(last_name) > 100:
        message = message or 'الإسم الأخير يجب ألا يتجاوز 100 حرفًا'

    if not message and userPassword.strip() == "":
        message = message or 'كلمة المرور مطلوبة'
    elif not message and len(userPassword) > 100:
        message = message or 'كلمة المرور يجب ألا تتجاوز 100 حرفًا'
    else:
        message = message or check_password(request.data.get("newPassword"))

    if message:
        return JsonResponse({"message": message}, status=400)
    if user_data['userPK'] != "":
        user_get.username=job_number
        user_get.first_name=first_name
        user_get.last_name=last_name
        user_get.save()
        user = user_get
    else:
        try:
            user = User.objects.create_user(
                username=job_number,
                first_name=first_name,
                last_name=last_name,
                password=userPassword
            )
        except:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({'screen': 'mainScreen','screenManager':'mainScreenManager','message':''}, status=201)

@csrf_exempt
def DeleteOrder(request):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({"message": "يجب تسجيل الدخول للوصول إلى هذا المحتوى."}, status=401)
    order = get_object_or_404(Order, pk = request.GET["pk"])
    order.delete()
    return JsonResponse({"message":"تم حذف الطلب بنجاح"}, status=201)

@api_view(['POST'])
def AddOrder(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "يجب تسجيل الدخول للوصول إلى هذا المحتوى."}, status=401)

    order_data = request.data
    order_data._mutable = True
    order_data['user'] = request.user.pk
    order_data._mutable = False
    if order_data["pk"] != "":
        order_get = Order.objects.get(pk=int(order_data["pk"]))

    message = None

    order_number = order_data.get('order_number')
    contractor = order_data.get('contractor')
    distract = order_data.get('distract')
    materials = order_data.get('materials')
    order_type = order_data.get('order_type', 'ملفات جاهزة')

    if not order_number:
        message = message or 'رقم الطلب مطلوب'
    elif len(order_number) > 50:
        message = message or 'رقم الطلب يجب ألا يتجاوز 50 حرفًا'
    if order_data["pk"] != "":
        if order_get.pk != int(order_data["pk"]):
            if Order.objects.filter(order_number=order_number).exists():
                message = message or 'رقم الطلب يجب أن يكون فريدًا'
    elif Order.objects.filter(order_number=order_number).exists():
        message = message or 'رقم الطلب يجب أن يكون فريدًا'

    if not message and len(contractor) > 100:
        message = message or 'اسم المقاول يجب ألا يتجاوز 100 حرفًا'

    if not message and len(distract) > 100:
        message = message or 'الحي يجب ألا يتجاوز 100 حرفًا'
    
    
    if len(materials) > 100:
        message = message or 'المواد يجب ألا تتجاوز 100 حرفًا'

    if not message and not order_type:
        message = message or 'نوع الطلب مطلوب'
    elif not message and order_type not in ['عداد', 'تنفيذ شبكة', 'طوارئ', 'إحلال', 'التعزيز', 'الجهد المتوسط', 'المشاريع', 'الملفات الجاهزة']:
        message = message or 'يجب أن يكون عداد أو تنفيذ شبكة'

    if message:
        return JsonResponse({"message": message}, status=400)
    if order_data['pk'] != "":
        updated_notes = [(key, value) for key, value in order_data.items() if key.startswith('updatedNote')]
        for note in updated_notes:
            try:
                gNote = ViolationImage.objects.get(pk=int(note[0].replace('updatedNote','')),order=order_get)
                gNote.notes=note[1]
                gNote.save()
            except:pass
        for deletedImage in order_data["deletedObjects"].split(","):
            if deletedImage != "":
                obj = ObjectImage.objects.get(pk=int(deletedImage),order=order_get)
                obj.delete()
        for deletedImage in order_data["deletedAddresses"].split(","):
            if deletedImage != "":
                adr = AddressImage.objects.get(pk=int(deletedImage),order=order_get)
                adr.delete()
        for deletedImage in order_data["deletedViolations"].split(","):
            if deletedImage != "":
                vio = ViolationImage.objects.get(pk=int(deletedImage),order=order_get)
                vio.delete()
        order_get.user=request.user
        order_get.order_number=order_number
        order_get.contractor=contractor
        order_get.distract=distract
        order_get.materials=materials
        order_get.order_type=order_type
        order_get.archived = False if order_data["archived"] == 'false' else True
        order_get.save()
        order = order_get
    else:
        try:
            order = Order.objects.create(
                user=request.user,
                order_number=order_number,
                contractor=contractor,
                distract=distract,
                materials=materials,
                order_type=order_type,
                archived = False if order_data["archived"] == 'false' else True
            )
        except:
            return JsonResponse({"message": str(e)}, status=400)

    # معالجة وحفظ صور الأشياء (Objects)
    objects_images_data = [(key, value) for key, value in order_data.items() if key.startswith('objectImage')]
    for key, value in objects_images_data:
        image_data = {'order': order.id, 'image': value}
        image_serializer = ObjectImageSerializer(data=image_data)
        if image_serializer.is_valid():
            image_serializer.save()
        else:
            return JsonResponse({"message": str(image_serializer.errors)}, status=400)

    # معالجة وحفظ صور العناوين (Addresses)
    addresses_images_data = [(key, value) for key, value in order_data.items() if key.startswith('addressImage')]
    for key, value in addresses_images_data:
        image_data = {
            'order': order.id,
            'image': value,
            'latitude': order_data.get(key.replace('addressImage', 'addressLatitude')),
            'longitude': order_data.get(key.replace('addressImage', 'addressLongitude'))
        }
        image_serializer = AddressImageSerializer(data=image_data)
        if image_serializer.is_valid():
            image_serializer.save()
        else:
            return JsonResponse({"message": str(image_serializer.errors)}, status=400)

    # معالجة وحفظ صور المخالفات (Violations)
    violations_images_data = [(key, value) for key, value in order_data.items() if key.startswith('violationImage')]
    for key, value in violations_images_data:
        image_data = {
            'order': order.id,
            'image': value,
            'notes': order_data.get(key.replace('violationImage', 'violationNote')),
            'latitude': order_data.get(key.replace('violationImage', 'violationLatitude')),
            'longitude': order_data.get(key.replace('violationImage', 'violationLongitude'))
        }
        image_serializer = ViolationImageSerializer(data=image_data)
        if image_serializer.is_valid():
            image_serializer.save()
        else:
            return JsonResponse({"message": str(image_serializer.errors)}, status=400)

    return JsonResponse({'message': 'Order uploaded successfully'}, status=201)