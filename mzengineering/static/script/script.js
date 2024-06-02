const screens = ['mainScreen'];

function addItem(newItem) {
	screens.push(newItem);

    if (screens.length > 2) {
        screens.shift();
    }
}

const navigateScreen = (screen, screenManager, back=false) => {
	openNavDrawer(false);
	if(document.querySelector(`#${screenManager} .opened-screen`).id != screen){
		if(screen != "imageEditor"){
			history.pushState(null, null, `/${screen}`);
			addItem(screen);
		}
		const openedScreen = $(`#${screenManager} .opened-screen`);
		if(!back){
			$(`#${screen}`).css({display:"block"});
		}
		openedScreen.css({zIndex:1});
		setTimeout(() => {
			$(`#${screen}`).addClass("opened-screen");
			$(`#${screen}`).removeAttr('style');
		}, 1)
		setTimeout(() => {
			openedScreen.removeClass("opened-screen");
		}, 200);
	}
}

const navigateBack = () => {
	navigateScreen(screens[0],'mainScreenManager');
}

const navigateDrawer = (screen) => {
	openNavDrawer(false);
	$(".visible-screen").removeClass('visible-screen');
	$(`#${screen}`).addClass('visible-screen');
	$(`.drawer .selected`).removeClass("selected");
	const btn = $(`#${screen}Btn`);
	btn.addClass("selected");
	$('#navHeader').text(btn.data('title'));
	if(typeof window[screen] === "function") {
		window[screen]();
	}
}

const navigateStepper = (stepperManager, next) => {
	if(next){
		if(document.querySelector(`#${stepperManager} > .stepper:first-child`).style.marginLeft == ""){
			stepperPos = 100;
		}else{
			stepperPos = parseInt(document.querySelector(`#${stepperManager} > .stepper:first-child`).style.marginLeft.replace("-","").replace("%",""))+100;
		}
		$(`#${stepperManager} > .stepper:first-child`).css({marginLeft:`-${stepperPos}%`});
	}else{
		stepperPos = document.querySelector(`#${stepperManager} > .stepper:first-child`).style.marginLeft.replace("-","").replace("%","")-100;
		$(`#${stepperManager} > .stepper:first-child`).css({marginLeft:`-${stepperPos}%`});
	}
}


const openNavDrawer = (open) => {
	const drawer = $("#drawer");
	const closer = $("#closer");
	if(open){
		drawer.css({display:"block"});
		closer.css({display:"block"});
		setTimeout(() => {
			drawer.addClass('open');
			closer.addClass('open');
		}, 1);
	}else{
		drawer.removeClass('open');
		closer.removeClass('open');
		setTimeout(() => {
			drawer.removeAttr('style');
			closer.removeAttr('style');
		}, 200);
	}
}

$(document).on("click", "#closer", () => openNavDrawer(false));


function rettext(value) {
	if (value) {
		return $('<div/>').text(value).html();
	} else {
		return '';
	}
}

snack_wit = false;
added_snack = [];
snacks = 0;
function snackBar(title , tp="0"){
	if(tp == "1"){
		if(snack_wit == false){
			snack_wit = true;
			document.getElementById("snackbar").removeAttribute("style");
			setTimeout(function(){
				document.getElementById("snackbar").style.bottom="20px";
				document.getElementById("snackbarText").textContent = title;
				setTimeout(function(){
					document.getElementById("snackbar").removeAttribute("style");
					snack_wit = false;
					snacks -= 1;
					if(snacks == 0){}
					else{
						otherSnackbar(added_snack[snacks]);
					}
				} , 5000);
			},250);
		}
	}else{
		added_snack.push(String(rettext(title)));
		snacks += 1;
		if(snack_wit == false){
			snack_wit = true;
			document.getElementById("snackbar").removeAttribute("style");
			setTimeout(function(){
				document.getElementById("snackbar").style.bottom="20px";
				document.getElementById("snackbarText").textContent = title;
				setTimeout(function(){
					document.getElementById("snackbar").removeAttribute("style");
					snack_wit = false;
					snacks -= 1;
					if(snacks == 0){}
					else{
						otherSnackbar(added_snack[snacks]);
					}
				} , 5000);
			},250);
		}
	}
}
function otherSnackbar(title){
	if(snack_wit == false){
		snack_wit = true;
		document.getElementById("snackbar").removeAttribute("style");
		setTimeout(function(){
			document.getElementById("snackbar").style.bottom="20px";
			document.getElementById("snackbarText").textContent = title;
			setTimeout(function(){
				document.getElementById("snackbar").removeAttribute("style");
				snack_wit = false;
				snacks -= 1;
				if(snacks <= 0){}
				else{
					snackBar(added_snack[snacks],"1");
				}
			} , 5000);
		},250);
	}
}




$(document).on("submit", "form[data-form]", function(e) {
    e.preventDefault();
    var thisElement = $(this);
    thisElement.css("opacity", ".8")
    var formData = new FormData(this);

    $.ajax({
        url: this.action,
        data: formData,
        type: 'POST',
        dataType: 'json',
        contentType: false,
        cache: false,
        processData: false,
        success: function(res) {
            thisElement.css("opacity", "");
            if (res.message === "") {
                navigateScreen(res.screen, res.screenManager);
            } else {
                snackBar(res.message);
            }
        },
        error: function() {
            snackBar("حدث خطأ أثناء الحفظ!");
        }
    });
});


$(document).on("click","[data-for]",function(){
	document.getElementById(this.dataset.for).click();
});

$(document).on("click","[data-dropdown]",function(){
	// الحصول على الإحداثيات النسبية للحاوية
	const element = $(this); // تحديد العنصر باستخدام jQuery

	// البحث عن العنصر الأب ذو الـ class "stepper"
	let parent = element.parent();
	while (parent.length && !parent.hasClass('stepper')) {
		parent = parent.parent();
	}

	// التحقق من العثور على العنصر الأب المناسب
	if (parent.length) {
		const parentRect = parent[0].getBoundingClientRect();
		const elementRect = element[0].getBoundingClientRect();
		const top = elementRect.top - parentRect.top;
		const left = elementRect.left - parentRect.left;

		menu = $(`#${this.dataset.dropdown}`);
		menu.css({width:`${this.clientWidth}px`,top:`${top}px`,left:`${left}px`,display:"block"});
		setTimeout(() => {
			menu.addClass("opened");
		},1);
	} else {
		console.error('لم يتم العثور على العنصر الأب ذو الـ class "stepper".');
	}
});


$(document).on("focusout", "[data-menu], [data-dropdown]", function () {
	setTimeout(() => {
	  $('.menu').each(function () {
		$(this).css({opacity:0});
		setTimeout(() => {
			$(this).removeAttr('style');
			$(this).removeClass('opened');
		},200);
	  });
	}, 100); // تأخير بسيط للتأكد من عدم تعارض الأحداث
});


$(document).on("click", ".menu button", function () {
	const buttonText = $(this).text();
	const dropdownInput = $(this).closest('.menu').prev('label').find('[data-dropdown]');
	dropdownInput.val(buttonText);
  
	// إغلاق القائمة بعد تحديد الخيار
	$(this).closest('.menu').css({ opacity: 0 });
	setTimeout(() => {
	  $(this).closest('.menu').removeAttr('style');
	  $(this).closest('.menu').removeClass('opened');
	}, 200);
});

let images;
let imagesCount = 0;

function subscribers(){
	images=undefined;
	imagesCount = 0;

	$("#objects").empty();
	$("#addresses").empty();
	$("#violations").empty();
}


$(document).on("change", "#image", function(event) {
    navigateScreen('imageEditor', 'mainScreenManager');
    const files = event.target.files;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.getElementById('selectedImage');
                img.src = e.target.result;
                if (images) {
                    images.destroy();
                }

                images = new Cropper(img, {
                    aspectRatio: NaN, // Allow free aspect ratio
                    viewMode: 1,
                    movable: true,
                    zoomable: true,
                    rotatable: true,
                    scalable: true,
                    autoCropArea: 0.5,
                    responsive: true,
                });

                event.target.value = '';
            };
            reader.readAsDataURL(file);
        }
    }
});

$('#cropButton').on('click', function() {
	if (images) {
		const canvas = images.getCroppedCanvas();
		const container = document.createElement("div");
		const croppedImageContainer = document.createElement("div");
		imagesCount += 1;
		croppedImageContainer.id = `image${imagesCount}`;

		const button = document.createElement("button");
		button.textContent = "حذف";
		button.type = "button"; // لمنع إرسال النموذج عند الضغط على زر الحذف
		button.dataset.delete = imagesCount;
		button.addEventListener('click', function() {
			deleteImage(parseInt(this.dataset.delete));
		});

		const croppedImage = document.createElement("img");
		croppedImage.src = canvas.toDataURL();
		croppedImage.classList.add('cropped-image');

		croppedImageContainer.appendChild(croppedImage);
		$(container).append(button);
		$(container).append(croppedImageContainer);
		$("#objects").append(container);

		navigateScreen(screens.length === 2 ? screens[1] : screens[0], 'mainScreenManager');
	}
});

// دالة لحذف صورة محددة من القائمة
function deleteImage(index) {
    const container = document.getElementById(`image${index}`);
    if (container) {
        container.remove();
    }
}


window.addEventListener('popstate', function() {
    navigateBack();
});

window.addEventListener('beforeunload', function () {
    navigateBack();
});

$('#imageForm').on('submit', function(event) {
    event.preventDefault(); // منع إرسال النموذج بالطريقة التقليدية

    const formData = new FormData(this);
    const croppedImages = document.querySelectorAll('.cropped-image');

    croppedImages.forEach((croppedImage, index) => {
        const blob = dataURItoBlob(croppedImage.src);
        formData.append(`croppedImage${index + 1}`, blob, `croppedImage${index + 1}.png`);
    });

    $.ajax({
        url: this.action,
        data: formData,
        type: 'POST',
        dataType: 'json',
        contentType: false,
        cache: false,
        processData: false,
        success: function(response) {
            console.log('Success:', response);
        },
        error: function(error) {
            console.log('Error:', error);
        }
    });
});

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}