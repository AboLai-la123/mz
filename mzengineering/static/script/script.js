const navigateScreen = (screen, screenManager, back=false) => {
	openNavDrawer(false);
	if(document.querySelector(`#${screenManager} .opened-screen`).id != screen){
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

function subscribers(){
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
            console.log(res)
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

$(document).on("click","[data-menu]",function(){
	console.log(this.getBoundingClientRect());
	$(`#${this.dataset.menu}`).css({width:`${this.clientWidth}px`,height:`${this.clientHeight}px`});
});