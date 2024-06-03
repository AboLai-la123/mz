from PIL import Image, ImageDraw, ImageFont, ImageOps
import arabic_reshaper
from bidi.algorithm import get_display

# تحميل الصورة
image_path = 'your_image_path.jpg'  # ضع مسار صورتك هنا
image = Image.open(image_path)

# التأكد من محاذاة الصورة بشكل صحيح
image = ImageOps.exif_transpose(image)

# تغيير حجم الصورة
max_width = 1000
max_height = 1500
image.thumbnail((max_width, max_height), Image.ANTIALIAS)

# تحميل الشعار
logo_path = './logo.png'  # ضع مسار الشعار هنا
logo = Image.open(logo_path)

# تغيير حجم الشعار ليكون 25% من عرض الصورة
logo_width = int(image.width * 0.60)
logo_ratio = logo_width / float(logo.width)
logo_height = int((float(logo.height) * float(logo_ratio)))
logo = logo.resize((logo_width, logo_height), Image.ANTIALIAS)

# إعدادات النص
texts = ["حمزة احمد", "حي : اللبن", "المقاول: الزامل", "الحدث : مشترك"]
reshaped_texts = [arabic_reshaper.reshape(text) for text in texts]  # تشكيل النصوص
bidi_texts = [get_display(reshaped_text) for reshaped_text in reshaped_texts]  # عكس اتجاه النصوص لتظهر بشكل صحيح

font_size = 36
font_path = "arial.ttf"  # ضع مسار الخط المناسب هنا
font = ImageFont.truetype(font_path, font_size)
text_color = (255, 255, 255)  # اللون الأبيض
shadow_color = (0, 0, 0)  # لون الظل (الأسود)
shadow_offset = (2, 2)  # إزاحة الظل

# إعدادات الرسم
draw = ImageDraw.Draw(image)

# تحديد مواقع النصوص وإضافتها إلى الصورة
margin = 10
y_offset = image.height - margin

for text in reversed(bidi_texts):
    text_width, text_height = draw.textsize(text, font=font)
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
image.save('output_image_with_logo_and_shadow.jpg')