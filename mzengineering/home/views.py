# from django.shortcuts import render
# from django.conf import settings
# import os

# # Create your views here.
# def home(request):
#     if request.method == 'POST' and request.FILES.get('croppedImage'):
#         cropped_image = request.FILES['croppedImage']
#         save_path = os.path.join(settings.BASE_DIR, 'home', cropped_image.name)

#         with open(save_path, 'wb+') as destination:
#             for chunk in cropped_image.chunks():
#                 destination.write(chunk)
#     context = {'isLoggedIn': "true" if request.user.is_authenticated else "false"}
#     return render(request, "home.html", context)


from django.shortcuts import render
from django.http import JsonResponse
from .models import *
# Create your views here.
def home(request, page_name="mainScreen"):
    context = {'isLoggedIn': "true" if request.user.is_authenticated else "false", "pageName": page_name}
    if request.user.is_authenticated:
        data = []
        if "order" in request.GET:
            order = Order.objects.get(pk = request.GET["order"])
            data.append(order.order_number)
            data.append(order.contractor)
            data.append(order.distract)
            data.append(order.materials)
            data.append(order.order_type)

            objects = ObjectImage.objects.filter(order=order)
            objects_list = []
            for obj in objects:
                objects_list.append(obj.image.url)
            addresses = AddressImage.objects.filter(order=order)
            addresses_list = []
            for adr in addresses:
                addresses_list.append(adr.image.url)
            violations = ViolationImage.objects.filter(order=order)
            violations_list = []
            for vio in violations:
                violations_list.append([vio.image.url, vio.notes])
            data.append(objects_list)
            data.append(addresses_list)
            data.append(violations_list)
            return JsonResponse({"data":data})
        months = [1,2,3,4,5,6,7,8,9,10,11,12]
        for m in months:
            dataFilter = Order.objects.filter(date_time__month=str(m),archived=False)
            if m == 1:monthName = "يناير"
            if m == 2:monthName = "فبراير"
            if m == 3:monthName = "مارس"
            if m == 4:monthName = "إبريل"
            if m == 5:monthName = "مايو"
            if m == 6:monthName = "يونيو"
            if m == 7:monthName = "يوليو"
            if m == 8:monthName = "أغسطس"
            if m == 9:monthName = "سبتمبر"
            if m == 10:monthName = "أكتوبر"
            if m == 11:monthName = "نوفمبر"
            if m == 12:monthName = "ديسمبر"
            values = []
            for d in dataFilter:
                # if "subscribers" in request.GET:
                #     if d.order_type != "تنفيذ شبكة" and d.order_type != "عداد":
                #         return JsonResponse({"data":data})

                # elif "operations" in request.GET:
                #     if d.order_type != "طوارئ" and d.order_type != "إحلال" and d.order_type != "التعزيز" and d.order_type != "الجهد المتوسط":
                #         return JsonResponse({"data":data})

                # elif "projects" in request.GET:
                #     if d.order_type != "المشاريع":
                #         return JsonResponse({"data":data})

                # elif "readyFiles" in request.GET:
                #     if d.order_type != "الملفات الجاهزة":
                #         return JsonResponse({"data":data})

                now = d.date_time
                if now.strftime('%A') == 'Sunday':dayName = "الأحد"
                if now.strftime('%A') == 'Monday':dayName = "الإثنين"
                if now.strftime('%A') == 'Tuesday':dayName = "الثلاثاء"
                if now.strftime('%A') == 'Wednesday':dayName = "الأربعاء"
                if now.strftime('%A') == 'Thursday':dayName = "الخميس"
                if now.strftime('%A') == 'Friday':dayName = "الجمعة"
                if now.strftime('%A') == 'Saturday':dayName = "السبت"
                values.append([d.order_number,d.order_type,f'{now.day} {dayName}',d.pk])
            if len(values) != 0:
                values = values[::-1]
                data.append([monthName,values])
        data = data[::-1]
        if len(request.GET) != 0:
            return JsonResponse({"data":data})
        context['data'] = data
    return render(request, "home.html", context)