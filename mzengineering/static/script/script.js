
function addItem(newItem) {
	screens.push(newItem);
}

const navigateScreen = (screen, screenManager, back=false) => {
	if(document.querySelector(`#${screenManager} .opened-screen`).id != screen){

		if(screen != "imageEditor"){
			history.replaceState(null, null, `/${screen}`);
			addItem(screen);
			openNavDrawer(false);

		}
		const openedScreen = $(`#${screenManager} .opened-screen`);
		if(!back){
			$(`#${screen}`).css({display:"block"});
		}else{
			$(`#${screen}`).css({display:"block"});
			$(`#${screen}`).css({transform:"scale(1.2)"});
			$(`#${screen}`).css({marginTop:"-50px"});
		}
		openedScreen.css({zIndex:1});
		setTimeout(() => {
			$(`#${screen}`).addClass("opened-screen");
			$(`#${screen}`).removeAttr('style');
		}, 10);
		setTimeout(() => {
			openedScreen.removeClass("opened-screen");
			openedScreen.removeClass("backed-screen");
		}, 200);
	}
}


const navigateBack = () => {
	backScreen = screens.length==1?screens[0]:screens[screens.length-1];
	if(backScreen != screen){
		navigateScreen(backScreen,'mainScreenManager',true);
		screens.pop();
	}
}

function navigateDrawer(screen,instance) {
	openNavDrawer(false);
	$("#homeScreenList").empty();
	$("#homeScreenList").empty();
	$("#orderDetailsContainer").empty();
	$("#orderScreenList").empty();
	$(".visible-screen").removeClass('visible-screen');
	$(`#${screen}`).addClass('visible-screen');
	$(`.drawer .selected`).removeClass("selected");
	const btn = $(`#${instance.id}`);
	btn.addClass("selected");
	$('#navHeader').text(btn.data('title'));
	if(typeof window[screen] === "function") {
		window[screen]();
	}
	if($('#navHeader').text() == "الإستشاريين"){
		viewUsers();
	}{
		viewData();
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

	if(this.id == "editPasswordForm") {
		if($("#newPassword").val() != $("#repeatPassword").val()){
			snackBar("كلمة المرور غير متطابقة");
			return;
		}
	}
    showLoading(true);

    var thisElement = $(this);
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
            showLoading(false);
			if(res.screen == "logout") location.href = "/";
            if($("#navHeader").text() == "الإستشاريين") viewUsers();
            if (res.message === "") {
                if(thisElement.attr("id") == "loginForm") {
                    location.href="/mainScreen";
                } else {
                    navigateScreen(res.screen, res.screenManager);
                }
                // فراغ المدخلات بعد النجاح
                thisElement.find('input[type="text"], input[type="email"], input[type="password"], textarea').val('');
                thisElement.find('input[type="checkbox"], input[type="radio"]').prop('checked', false);
                thisElement.find('select').prop('selectedIndex', 0);
            } else {
                snackBar(res.message);
            }
        },
        error: function(error) {
            showLoading(false);
            snackBar(error.responseJSON.message);
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
		alert('لم يتم العثور على العنصر الأب ذو الـ class "stepper".');
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
	const dropdownInput = $("#order_type");
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
let pickType = "";
let deletedObjects = [];
let deletedAddresses = [];
let deletedViolations = [];
let updatedNotes = [];

function orders(){
	imagesCount = 0;
	pickType = "";
	deletedObjects = [];
	deletedAddresses = [];
	deletedViolations = [];
	updatedNotes = [];

	$("#objects").empty();
	$("#addresses").empty();
	$("#violations").empty();
	const img = document.getElementById('selectedImage');
	if (images) {
		images.destroy();
		images = null;
		img.style.display = 'none'; // Hide the image
		img.src = ''; // Clear the src attribute
	}
	images=undefined;
}


$(document).on("click","[data-pick]",function(){
	pickType = this.dataset.name;
	document.getElementById(this.dataset.pick).click();
});


$(document).on("change", "#image", function(event) {
    navigateScreen('imageEditor', 'mainScreenManager');
	showLoading(true);

	setTimeout(() => {
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
		showLoading(false);
	}, 200);
});

$(document).on("click","#imageStudioBackBtn", function(){
	images.destroy();
	navigateScreen('addOrder', 'mainScreenManager');
});

$('#cropButton').on('click', function() {
	showLoading(true);
	setTimeout(() => {
		if (images) {
			const canvas = images.getCroppedCanvas();
			const croppedImageContainer = document.createElement("div");
			imagesCount += 1;
			croppedImageContainer.id = `image${imagesCount}`;
	
			const button = document.createElement("button");
			button.textContent = "حذف";
			button.type = "button"; // لمنع إرسال النموذج عند الضغط على زر الحذف
			button.dataset.delete = imagesCount;
	
			const croppedImage = document.createElement("img");
			croppedImage.src = canvas.toDataURL();
			croppedImage.classList.add('cropped-image');
			navigator.geolocation.getCurrentPosition(function(position) {
				// تم جلب الإحداثيات بنجاح
				var latitude = position.coords.latitude;
				var longitude = position.coords.longitude;
				croppedImage.setAttribute('data-latitude', latitude);
				croppedImage.setAttribute('data-longitude', longitude);
				croppedImage.setAttribute('data-index', imagesCount);
	
				// يمكنك استخدام الإحداثيات هنا لعمل أي شيء آخر
			  }, function(error) {
				// في حالة فشل في جلب الإحداثيات
				switch(error.code) {
				  case error.PERMISSION_DENIED:
					alert("لم يتم السماح بالوصول إلى خدمة الموقع من قبل المستخدم.")
					break;
				  case error.POSITION_UNAVAILABLE:
					alert("الموقع غير متوفر.")
					break;
				  case error.TIMEOUT:
					alert("انتهت مهلة الاستجابة لجلب الإحداثيات.")
					break;
				  case error.UNKNOWN_ERROR:
					alert("حدث خطأ غير معروف.")
					break;
				}
			  });
	
			croppedImageContainer.appendChild(croppedImage);
			$(croppedImageContainer).append(button);
			$(`#${pickType}`).append(croppedImageContainer);
			if(pickType == "violations"){
				const textarea = document.createElement("textarea");
				textarea.classList.add("textarea");
				textarea.placeholder = "وصف المخالفة";
				textarea.id = `violationNote${imagesCount}`;
				$(`#${pickType}`).append(textarea);
			}
	
			navigateScreen('addOrder','mainScreenManager');
			showLoading(false);
		}
	},200);
});

$(document).on("click","[data-delete]",function(){
	index = this.dataset.delete;
	const container = document.getElementById(`image${index}`);
    if (container) {
        container.remove();
		note = document.getElementById(`violationNote${index}`);
		if(note) note.remove();
    }
});


window.addEventListener('popstate', function() {
    navigateBack();
});

window.addEventListener('beforeunload', function () {
    navigateBack();
});

$('#imageForm').on('submit', function(event) {
    event.preventDefault(); // منع إرسال النموذج بالطريقة التقليدية
	showLoading(true);

    const formData = new FormData(this);

	const objectsImages = document.querySelectorAll('#objects > div:not([data-broke]) > .cropped-image');
	objectsImages.forEach((croppedImage, index) => {
		const blob = dataURItoBlob(croppedImage.src);
		formData.append(`objectImage${index + 1}`, blob, `objectImage${index + 1}.png`);
	});

	const addressesImages = document.querySelectorAll('#addresses > div:not([data-broke]) > .cropped-image');
	addressesImages.forEach((croppedImage, index) => {
		const blob = dataURItoBlob(croppedImage.src);
		formData.append(`addressImage${index + 1}`, blob, `addressImage${index + 1}.png`);
		formData.append(`addressLatitude${index + 1}`, croppedImage.dataset.latitude);
		formData.append(`addressLongitude${index + 1}`, croppedImage.dataset.longitude);
	});

	const violationsImages = document.querySelectorAll('#violations > div:not([data-broke]) > .cropped-image');
	violationsImages.forEach((croppedImage, index) => {
		const blob = dataURItoBlob(croppedImage.src);
		formData.append(`violationImage${index + 1}`, blob, `violationImage${index + 1}.png`);
		formData.append(`violationLatitude${index + 1}`, croppedImage.dataset.latitude);
		formData.append(`violationLongitude${index + 1}`, croppedImage.dataset.longitude);
		formData.append(`violationNote${index + 1}`, $(`#violationNote${croppedImage.dataset.index}`).val());
	});

	formData.append('archived',archived);
	formData.append("deletedObjects",deletedObjects)
	formData.append("deletedAddresses",deletedAddresses)
	formData.append("deletedViolations",deletedViolations)

	updatedNotes.forEach(note => {
		formData.append(`updatedNote${$(`#${note}`).data('note')}`,$(`#${note}`).val());
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
			$("#pk").val("");
			$("#order_number").val("");
			$("#contractor").val("");
			$("#distract").val("");
			$("#materials").val("");
			$("#order_type").val("عداد");
			snackBar("تم حفظ بيانات الطلب بنجاح");
			orders();
			getData("home","homeScreenList");
			navigateScreen('mainScreen','mainScreenManager',true);
			showLoading(false);
        },
        
        error: function(error) {
			showLoading(false);
			try{
				snackBar(error.responseJSON.message);
			}catch {snackBar("حدث خطأ اثناء الحفظ الرجاء المحاولة مرة اخرى");}
        }
    });
});

const showLoading = (show) => {
	if(show){
		$(".loading-screen").css({display:"block"});
		setTimeout(() => $(".loading-screen").css({opacity:1}), 1);
	}else{
		$(".loading-screen").css({opacity:0});
		setTimeout(() => $(".loading-screen").removeAttr("style"), 200);
	}
}

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

const openAddOrderScreen = () => {
	orders();
	navHeader = $("#navHeader").text();

	$("#pk").val("");
	$("#order_number").val("");
	$("#contractor").val("");
	$("#distract").val("");
	$("#materials").val("");
	$("#order_type").val("");
	$("#objects").empty();
	$("#addresses").empty();
	$("#violations").empty();
	try{$("#deleteOrderContainer").css({display:"none"});}
	catch{}

	$("#workTypeContainer, #materialsContainer, #inputsContainer").removeAttr("style");
	$("#order_type_menu").empty();

	$("#contractor").attr("required", "");
	$("#distract").attr("required", "");
	if(navHeader == "المشتركين") {
		$("#materialsContainer").css({display:"none"});
		$("#order_type").val('عداد');
		$("#order_type_menu").append(`<button type="button">عداد</button><button type="button">تنفيذ شبكة</button>`);
	}else if(navHeader == "العمليات والصيانة") {
		$("#order_type").val('طوارئ');
		$("#order_type_menu").append(`<button type="button">طوارئ</button><button type="button">إحلال</button><button type="button">التعزيز</button><button type="button">الجهد المتوسط</button>`);
	}else if(navHeader == "المشاريع"){
		$("#materialsContainer").css({display:"none"});
		$("#workTypeContainer").css({display:"none"});
		$("#order_type").val('المشاريع');
	}
	else if(navHeader == "الملفات الجاهزة"){
		$("#contractor").removeAttr("required");
		$("#distract").removeAttr("required");
		$("#inputsContainer").css({display:"none"});
		$("#order_type").val('الملفات الجاهزة');
	}
	navigateScreen('addOrder','mainScreenManager');
}

$(document).on("click","#addOrderBtn",function(){
	openAddOrderScreen();
});

const viewUsers = () => {
	showLoading(true);
	$(`#usersList`).empty();
	$.ajax({
        url: location.href+`?users`,
        type: 'GET',
        success: function(res) {
            res.users.forEach(user => {
				$(`#usersList`).append(`<button class="item" data-user="${user[0]}">
				<p class="list-item-header">${rettext(user[1])} ${rettext(user[2])}</p>
				<p>الدور : ${user[3]?"مدير":"إستشاري"}</p>
			  </button>`);
			});
			showLoading(false);
        },
		error: function(){
			showLoading(false);
		}
    });
}

const getData = (table, listID) => {
	showLoading(true);
	$(`#${listID}`).empty();
	$.ajax({
        url: location.href+`?${table}`,
        type: 'GET',
        success: function(res) {
            res.data.forEach(d => {
				if(listID == "orderScreenList"){
					$(`#${listID}`).append(`<p class='month'>${d[0]}</p>`);
					d[1].forEach(w => {
						$(`#${listID}`).append(`<button class="item" data-archive = "${w[3]}">
						<p>رقم الطلب : ${w[0]}</p>
						<p>نوع الطلب : ${w[1]}</p>
						<p>${w[2]}</p>
					</button>
					<br>`);
					});
				}else{
					$(`#${listID}`).append(`<p class='month'>${d[0]}</p>`);
					d[1].forEach(w => {
						$(`#${listID}`).append(`<button class="item" data-order = "${w[3]}">
						<p>رقم الطلب : ${w[0]}</p>
						<p>نوع الطلب : ${w[1]}</p>
						<p>${w[2]}</p>
					</button>
					<br>`);
					});
				}
			});
			showLoading(false);
        },
		error: function(){
			showLoading(false);
		}
    });
}

const viewData = () => {
	if($("#navHeader").text() == "المشتركين"){
		getData('subscribers','orderScreenList');
	}
	else if($("#navHeader").text() == "العمليات والصيانة"){
		getData('operations','orderScreenList');
	}
	else if($("#navHeader").text() == "المشاريع"){
		getData('projects','orderScreenList');
	}
	else if($("#navHeader").text() == "الملفات الجاهزة"){
		getData('readyFiles','orderScreenList');
	}else{
		getData('home','homeScreenList');
	}
}

$(document).on("click","#viewOrderBtn",function(){
	navigateScreen('viewOrders','mainScreenManager');
	viewData();
});

$(document).on("click","[data-broke]",function(){
	broke = this.dataset.broke;
	if(broke.slice(0,3) == "obj") deletedObjects.push(this.dataset.broke.slice(3,));
	else if(broke.slice(0,3) == "adr") deletedAddresses.push(this.dataset.broke.slice(3,));
	else deletedViolations.push(this.dataset.broke.slice(3,));
});

$(document).on("click","[data-archive]",function(){
	this_el = this;
	showLoading(true);
	$.ajax({
        url: location.href+`?archive=${this_el.dataset.archive}`,
        type: 'GET',
        success: function(res) {
			navigateScreen("addOrder","mainScreenManager");
			openAddOrderScreen();

			$("#pk").val(res.data[8]);
			$("#order_number").val(res.data[0]);
			$("#contractor").val(res.data[1]);
			$("#distract").val(res.data[2]);
			$("#materials").val(res.data[3]);
			$("#order_type").val(res.data[4]);
			try{
				$("#deleteOrderContainer").css({display:"block"});
				$("#dataDeleteOrder2").attr("data-delete-order", `${res.data[8]}`);
			}
			catch{}

			$("#objects").empty()
			res.data[5].forEach(object => {
					$("#objects").append(`<div data-broke = 'obj${object[1]}' id="image${imagesCount}"><img src="${rettext(object[0])}" class="cropped-image" data-index="${imagesCount}"><button type="button" data-delete="${imagesCount}">حذف</button></div>`);
					imagesCount++;
				}
			);

			res.data[6].forEach(address => {
					$("#addresses").append(`<div data-broke = 'adr${address[1]}' id="image${imagesCount}"><img src="${rettext(address[0])}" class="cropped-image" data-index="${imagesCount}"><button type="button" data-delete="${imagesCount}">حذف</button></div>`);
					imagesCount++;
				}
			);

			res.data[7].forEach(violation => {
					$("#violations").append(`<div data-broke = 'vio${violation[2]}' id="image${imagesCount}"><img src="${rettext(violation[0])}" class="cropped-image" data-index="${imagesCount}"><button type="button" data-delete="${imagesCount}">حذف</button></div>`);
					$("#violations").append(`<textarea class="textarea" data-note="${violation[2]}" placeholder="وصف المخالفة" id="violationNote${imagesCount}">${rettext(violation[1])}</textarea>`);
					imagesCount++;
				}
			);

			showLoading(false);
        },
		error: function(error){
			showLoading(false);
		}
    });
});

$(document).on("change","[data-note]",function(){
	if(!this.id.includes(...updatedNotes)) updatedNotes.push(this.id);
});

$(document).on("click","[data-order]",function(){
	this_el = this;
	showLoading(true);
	$.ajax({
        url: location.href+`?order=${this_el.dataset.order}`,
        type: 'GET',
        success: function(res) {
			$("#orderDetailsContainer").empty();
			$("#orderDetailsContainer").append(`<div class="data"><p class="key">رقم الطلب</p><p class="value">${res.data[0]}</p></div>`);
			if(res.data[1] != null && res.data[1] != "") $("#orderDetailsContainer").append(`<div class="data"><p class="key">المقاول</p><p class="value">${res.data[1]}</p></div>`);
			if(res.data[2] != null && res.data[2] != "") $("#orderDetailsContainer").append(`<div class="data"><p class="key">الحي</p><p class="value">${res.data[2]}</p></div>`);
			if(res.data[3] != null && res.data[3] != "") $("#orderDetailsContainer").append(`<div class="data"><p class="key">المواد</p><p class="value">${res.data[3]}</p></div>`);
			$("#orderDetailsContainer").append(`<div class="data"><p class="key">نوع الطلب</p><p class="value">${res.data[4]}</p></div>`);

			if(res.data[5].length!==0)$("#orderDetailsContainer").append(`<br><br><p class="order-img-header">النماذج</p>`);
			res.data[5].forEach(url => $("#orderDetailsContainer").append(`<a data-fancybox="gallery" href="${url[0]}" data-caption="نموذج"><img loading="lazy" class="order-image" src="${url[0]}"></a>`));
			if(res.data[6].length!==0)$("#orderDetailsContainer").append(`<br><br><p class="order-img-header">صور الموقع</p>`);
			res.data[6].forEach(url => $("#orderDetailsContainer").append(`<a data-fancybox="gallery" href="${url[0]}" data-caption="صور الموقع"><img loading="lazy" class="order-image" src="${url[0]}"></a>`));
			if(res.data[7].length!==0)$("#orderDetailsContainer").append(`<br><br><p class="order-img-header">مخالفات السلامة</p>`);
			res.data[7].forEach(url => 
				$("#orderDetailsContainer").append(`<a data-fancybox="gallery" href="${rettext(url[0])}" data-caption="مخالفات السلامة"><img loading="lazy" class="order-image" src="${rettext(url[0])}"></a><p><span>وصف المخالفة:</span><br>${rettext(url[1])}</p>`)
			);

			$("#orderDetailsContainer").append(`
			<br><br>
			<div style="width:80%;margin:auto;">
			  <hr>
			  <br><br>
			  <a href='/export/${res.data[8]}' class="primary" style="width:100%;">تصدير</a>
			  ${isSuperUser?`<br>
			  <button data-delete-order='${res.data[8]}' class="outline-error" style="width:100%;" id="deleteOrderBtn">حذف</button>`:""}
			  <br><br>
			</div>`);

			navigateScreen("orderDetails","mainScreenManager");
			showLoading(false);
        },
		error: function(error){
			showLoading(false);
		}
    });
});

$(document).on("click","[data-delete-order]",function(){
	if(confirm("هل أنت متأكد أنك تريد الحذف؟")){
		showLoading(true);
		$.ajax({
			url: `/api/delete?pk=${this.dataset.deleteOrder}`,
			type: 'GET',
			success: function(res) {
				showLoading(false);
				viewData();
				snackBar(res.message);
				navigateScreen("mainScreen","mainScreenManager",true);
			},
			error: function(error) {
				showLoading(false);
				snackBar(error.responseJSON.message);
			}
		});
	}
});

$(document).on("click","#orderDetailsBackBtn",function(){
	if (screens[screens.length-2] == "searchScreen") navigateScreen('searchScreen','mainScreenManager',true);
	else if($("#navHeader").text() != "الصفحة الرئيسية") navigateScreen('viewOrders','mainScreenManager',true);
	else navigateScreen('mainScreen','mainScreenManager',true);
});

window.onload = () => {
	const urls = ["/viewOrders","/orderDetails","/addUserScreen","/editPasswordScreen"];
	if(urls.includes(location.pathname)) location.href="/";
}

archived = false;

$(document).on("click", "#saveOrder", function(){
	archived = false;
});


$(document).on("click", "#archiveOrder", function(){
	archived = true;
});

function debounce(func, delay) {
    let timeoutId;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
            func.apply(context, args);
        }, delay);
    };
}

// تحديد وظيفة لإرسال البحث إلى السيرفر
function sendSearchRequest() {
    // قم بإرسال البحث إلى السيرفر هنا
	searchValue = $("#search").val();
	if(searchValue.trim() == "") $("#searchResult").empty();
	else{
		$.ajax({
			url: location.href+`?search=${searchValue}`,
			type: 'GET',
			success: function(res) {
				$("#searchResult").empty();
				res.data.forEach(d => $("#searchResult").append(`<button class="item" data-order="${d[0]}">
				<p>رقم الطلب : ${d[1]}</p>
				<p>نوع الطلب : ${d[2]}</p>
				<p>${d[3]}</p>
			  </button>`));
			}
		});
	}
}

const input = document.getElementById('search');

// تطبيق debounce على وظيفة sendSearchRequest بفاصل زمني 500 مللي ثانية (نصف ثانية)
const debouncedSendSearchRequest = debounce(sendSearchRequest, 500);

// استماع لحدث الكتابة داخل input
input.addEventListener('input', debouncedSendSearchRequest);


$(document).on("click","#addUser",function(){
	$("#userPK").val('');
	$("#job_number").val('');
	$("#first_name").val('');
	$("#last_name").val('');
	$("#userPassword").attr('required','');
	$("#passwordContainer").removeAttr("style");
	$("#userScreenHeader").text("إضافة إستشاري");
	$("#editPasswordContainer").css({display:"none"});
	navigateScreen("addUserScreen","mainScreenManager");
});

$(document).on("click","#editPassword",function(){
	navigateScreen("editPasswordScreen","mainScreenManager");
});

$(document).on("click","#settingsBtn",function(){
	this_el = this;
	showLoading(true);
	$.ajax({
		url: location.href+`?user=${this.dataset.pk}`,
		type: 'GET',
		success: function(res) {
			showLoading(false);
			$("#userPK").val(res.data[0]);
			$("#job_number").val(res.data[1]);
			$("#first_name").val(res.data[2]);
			$("#last_name").val(res.data[3]);
			$("#userPassword").removeAttr('required');
			$("#passwordContainer").css({display:"none"});
			$("#userScreenHeader").text("تعديل بيانات الملف الشخصي");
			$("#editPasswordContainer").css({display:"block"});
			navigateScreen('addUserScreen',"mainScreenManager");
		}
	});
});