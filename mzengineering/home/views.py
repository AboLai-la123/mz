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


from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from .models import *
from django.db.models import Q
import os
import uuid

# Create your views here.
def home(request, page_name="mainScreen"):
    context = {'isLoggedIn': "true" if request.user.is_authenticated else "false", "pageName": page_name,"isSuperUser":'false'}
    if request.user.is_authenticated:
        data = []
        if "search" in request.GET:
            data = []
            for order in Order.objects.filter(Q(order_number__icontains = request.GET['search'])|Q(order_type__icontains = request.GET['search'])).filter(archived=False)[:10][::-1]:
                now = order.date_time
                if now.strftime('%A') == 'Sunday':dayName = "الأحد"
                if now.strftime('%A') == 'Monday':dayName = "الإثنين"
                if now.strftime('%A') == 'Tuesday':dayName = "الثلاثاء"
                if now.strftime('%A') == 'Wednesday':dayName = "الأربعاء"
                if now.strftime('%A') == 'Thursday':dayName = "الخميس"
                if now.strftime('%A') == 'Friday':dayName = "الجمعة"
                if now.strftime('%A') == 'Saturday':dayName = "السبت"
                data.append([order.pk,order.order_number,order.order_type,f'{now.day} {dayName}'])
            return JsonResponse({"data":data})
        elif "user" in request.GET:
            data = [
                request.user.pk,
                request.user.username,
                request.user.first_name,
                request.user.last_name,
            ]
            return JsonResponse({"data":data})
        elif "users" in request.GET and request.user.is_superuser:
            users = []
            for user in User.objects.all()[::-1]:
                users.append([
                    user.pk,
                    user.first_name,
                    user.last_name,
                    user.is_superuser,
                ])
            return JsonResponse({"users":users})
        elif "order" in request.GET or "archive" in request.GET:
            order_type = "order"
            if "archive" in request.GET:
                order_type = "archive"
            order = Order.objects.get(pk = request.GET[order_type])
            data.append(order.order_number)
            data.append(order.contractor)
            data.append(order.distract)
            data.append(order.materials)
            data.append(order.order_type)

            objects = ObjectImage.objects.filter(order=order)
            objects_list = []
            for obj in objects:
                objects_list.append([obj.image.url,obj.pk])
            addresses = AddressImage.objects.filter(order=order)
            addresses_list = []
            for adr in addresses:
                addresses_list.append([adr.image.url,adr.pk])
            violations = ViolationImage.objects.filter(order=order)
            violations_list = []
            for vio in violations:
                violations_list.append([vio.image.url, vio.notes, vio.pk])
            data.append(objects_list)
            data.append(addresses_list)
            data.append(violations_list)
            data.append(order.pk)
            return JsonResponse({"data":data})
        months = [1,2,3,4,5,6,7,8,9,10,11,12]
        for m in months:
            if "subscribers" in request.GET:
                dataFilter = Order.objects.filter(
                    date_time__month=str(m),
                    archived=True,
                ).filter(Q(order_type="عداد")|Q(order_type="تنفيذ شبكة"))

            elif "operations" in request.GET:
                dataFilter = Order.objects.filter(
                    date_time__month=str(m),
                    archived=True,
                ).filter(Q(order_type="طوارئ")|Q(order_type="إحلال")|Q(order_type="التعزيز")|Q(order_type="الجهد المتوسط"))

            elif "projects" in request.GET:
                dataFilter = Order.objects.filter(
                    date_time__month=str(m),
                    archived=True,
                    order_type="المشاريع"
                )

            elif "readyFiles" in request.GET:
                dataFilter = Order.objects.filter(
                    date_time__month=str(m),
                    archived=True,
                    order_type="الملفات الجاهزة"
                )
            else:
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
        context['users'] = User.objects.all()[::-1]
        context["isSuperUser"] = "true" if request.user.is_superuser else "false"
    return render(request, "home.html", context)



def export_order_as_pdf(request, order_pk):
    order = get_object_or_404(Order, pk=order_pk)
    if order.pdf_file_name == "" or order.pdf_file_name == None:
        order.pdf_file_name = f"{str(uuid.uuid4())}.pdf"
        order.save()
    if os.path.expanduser("~") == "C:\\Users\\H1720":
        pdf_file_path = f'C:/Users/H1720/Documents/newmz/mz/mzengineering/media/exportPDF/{order.pdf_file_name}'
    else:
        pdf_file_path = f'/home/assays/mz/mzengineering/media/exportPDF/{order.pdf_file_name}'

    image_list = [
        Image.open(obj.image.path).convert('RGB') for obj in ObjectImage.objects.filter(order=order)
    ] + [
        Image.open(addr.image.path).convert('RGB') for addr in AddressImage.objects.filter(order=order)
    ] + [
        Image.open(viol.image.path).convert('RGB') for viol in ViolationImage.objects.filter(order=order)
    ]

    if image_list:
        image_list[0].save(pdf_file_path, save_all=True, append_images=image_list[1:])

    with open(pdf_file_path, 'rb') as pdf_file:
        response = HttpResponse(pdf_file.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename={os.path.basename(pdf_file_path)}'
        return response