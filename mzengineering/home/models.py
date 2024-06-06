from django.db import models
from PIL import Image, ImageDraw, ImageFont, ImageOps
from io import BytesIO
import os
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

import arabic_reshaper
from bidi.algorithm import get_display

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order_number = models.CharField(max_length=50)
    contractor = models.CharField(max_length=100, null=True, blank=True)
    distract = models.CharField(max_length=100, null=True, blank=True)
    materials = models.CharField(max_length=100, null=True, blank=True)
    date_time = models.DateTimeField(auto_now_add=True)
    ORDER_TYPES = [
        ('عداد', 'عداد'),
        ('تنفيذ شبكة', 'تنفيذ شبكة'),
        ('طوارئ', 'طوارئ'),
        ('إحلال', 'إحلال'),
        ('التعزيز', 'التعزيز'),
        ('الجهد المتوسط', 'الجهد المتوسط'),
        ('المشاريع', 'المشاريع'),
        ('الملفات الجاهزة', 'الملفات الجاهزة'),
    ]
    order_type = models.CharField(max_length=50, choices=ORDER_TYPES)
    pdf_file_name = models.CharField(max_length=100,null=True,blank=True)

    archived = models.BooleanField(default=False)

class ObjectImage(models.Model):
    order = models.ForeignKey(Order, related_name='object_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='object_images')

class AddressImage(models.Model):
    order = models.ForeignKey(Order, related_name='address_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='address_images')
    latitude = models.CharField(max_length=20)
    longitude = models.CharField(max_length=20)

class ViolationImage(models.Model):
    order = models.ForeignKey(Order, related_name='violation_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='violation_images')
    notes = models.TextField(null=True, blank=True)
    latitude = models.CharField(max_length=20)
    longitude = models.CharField(max_length=20)



# -- Proccessing Image -- #

def process_image(image, instance):
    image_path = image
    image = Image.open(image)

    # التأكد من محاذاة الصورة بشكل صحيح
    image = ImageOps.exif_transpose(image)

    # تغيير حجم الصورة
    max_width = 1000
    max_height = 1500
    image.thumbnail((max_width, max_height), Image.LANCZOS)

    # تحميل الشعار
    if os.path.expanduser("~") == "C:\\Users\\H1720":
        path = r'C:\Users\H1720\Documents\newmz\mz\mzengineering\static\fonts\noto.ttf'
        logo_path = r'C:\Users\H1720\Documents\newmz\mz\mzengineering\static\images\logo.png'
    else:
        path = '/home/assays/mz/mzengineering/static/fonts/noto.ttf'
        logo_path = '/home/assays/mz/mzengineering/static/images/logo.png'  # ضع مسار الشعار هنا
    logo = Image.open(logo_path)

    # تغيير حجم الشعار ليكون 25% من عرض الصورة
    logo_width = int(image.width * 0.60)
    logo_ratio = logo_width / float(logo.width)
    logo_height = int((float(logo.height) * float(logo_ratio)))
    logo = logo.resize((logo_width, logo_height), Image.LANCZOS)

    # إعدادات النص
    texts = [f"{instance.order.user.first_name} {instance.order.user.last_name}", instance.order.distract, f'{instance.latitude}N {instance.longitude}E'[::-1]]
    reshaped_texts = [arabic_reshaper.reshape(text) for text in texts]  # تشكيل النصوص
    bidi_texts = [get_display(reshaped_text[::-1]) for reshaped_text in reshaped_texts]  # عكس اتجاه النصوص لتظهر بشكل صحيح

    font_size = 36
    font = ImageFont.truetype(path, font_size)
    text_color = (255, 255, 255)  # اللون الأبيض
    shadow_color = (0, 0, 0)  # لون الظل (الأسود)
    shadow_offset = (2, 2)  # إزاحة الظل

    # إعدادات الرسم
    draw = ImageDraw.Draw(image)

    # تحديد مواقع النصوص وإضافتها إلى الصورة
    margin = 10
    y_offset = image.height - margin

    for text in reversed(bidi_texts):
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width, text_height = text_bbox[2] - text_bbox[0], text_bbox[3] - text_bbox[1]
        x = image.width - text_width - margin
        y_offset -= text_height
        # رسم الظل
        draw.text((x + shadow_offset[0], y_offset + shadow_offset[1]), text, font=font, fill=shadow_color)
        # رسم النص الأساسي
        draw.text((x, y_offset), text, font=font, fill=text_color)
        y_offset -= margin

    # إضافة الشعار في الزاوية العلوية اليسرى
    logo_position = (20, 20)
    image.paste(logo, logo_position, logo.convert("RGBA"))

    # حفظ الصورة
    image.save(image_path)


@receiver(post_save, sender=AddressImage)
def process_address_image(sender, instance, **kwargs):
    process_image(instance.image.path,instance)

@receiver(post_save, sender=ViolationImage)
def process_violation_image(sender, instance, **kwargs):
    process_image(instance.image.path,instance)