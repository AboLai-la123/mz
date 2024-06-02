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

# Create your views here.
def home(request, page_name):
    if request.method == "POST":
        print(request.POST)
        print(request.FILES)
    context = {'isLoggedIn': "true" if request.user.is_authenticated else "false", "pageName": page_name}
    return render(request, "home.html", context)