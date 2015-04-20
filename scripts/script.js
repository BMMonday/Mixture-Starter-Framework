// JavaScript Document
var maxWidth = 980, $wrapper, $toTop, $body, $footer, $headerNav, $userNav, $footerNav, footerRoom = false, $footerPadEl, $leftMenu, $rightMenu;

$(document).ready(function(){
	$wrapper = $('#wrapper');
	$toTop = $('#toTop');
	$body = $('body');
	$headerNav = $('#header').find('#headerNav');
	$userNav = $('#userNav');
	$footer = $('#footer');
	$footerNav = $('#footerNav');
	$footerPadEl = $('#wrapper');//Element to get padding equal to the height of the footer, for sticky/slide out footer
	$leftMenu = $headerNav;
	$rightMenu = $('#sidebar').find('#sideNav');
	$centerMenu = $('#centerMenuEg');

	//Create off canvas menus
	//Default settings for all menus
	$.offCanvas({
		target: '#offCanvasHolder',
		hiddenClass: 'hideMenu',
		//idSuffix: '-ocClone',
		pushElems: '#wrapper',
		//menuWidth: '80%',
		//animSpeed: '400',
		//levelUpIcon: 'arrow-left',
		//onInit: function() {
		//	console.log("global onInit");
		//},
		//onOpen: function() {
		//	console.log("global onOpen");
		//},
		//onClose: function() {
		//	console.log("global onClose");
		//},
		//onOverlayClick: function() {
		//	console.log("global onOverlayClick");
		//}
	});
	$leftMenu.offCanvas({
		//copyType: 'clone',
		//side: 'left',
		//target: 'body',
		titleText: 'Menu',
		//toggleIcon: 'menu',
		//iconOnly: true,
		//hiddenClass: 'hideMenu',
		//idSuffix: '-ocClone',
		//pushElems: '#wrapper, #footer',
		//menuWidth: '80%',
		//animSpeed: '400'
	});
		//Any menus set to the same side as an existing menu will be added beneath, with 'titleText' added as a list item above each
		$userNav.offCanvas({
			side: 'left',
			titleText: 'Account',
			//onInit: function() {
			//	console.log("$userNav onInit");
			//},
			//onOpen: function() {
			//	console.log("$userNav onOpen");
			//},
			//onClose: function() {
			//	console.log("$userNav onClose");
			//},
			//onOverlayClick: function() {
			//	console.log("$userNav onOverlayClick");
			//}
		});
	$centerMenu.offCanvas({
		copyType: 'original',
		side: 'center',
		titleText: 'Center Menu',
		toggleIcon: 'grid',
		iconOnly: true,
		//menuWidth: '80%',
		//animSpeed: '400',
		//onInit: function() {
		//	console.log("$centerMenu onInit");
		//},
		//onOpen: function() {
		//	console.log("$centerMenu onOpen");
		//},
		//onClose: function() {
		//	console.log("$centerMenu onClose");
		//},
		//onOverlayClick: function() {
		//	console.log("$centerMenu onOverlayClick");
		//}
	});
	$rightMenu.offCanvas({
		copyType: 'original',
		side: 'right',
		titleText: 'Menu',
		//toggleIcon: 'menu',
		//iconOnly: true,
		//menuWidth: '80%',
		//animSpeed: '400',
		//onInit: function() {
		//	console.log("$rightNav onInit");
		//},
		//onOpen: function() {
		//	console.log("$rightMenu onOpen");
		//},
		//onClose: function() {
		//	console.log("$rightMenu onClose");
		//},
		//onOverlayClick: function() {
		//	console.log("$rightMenu onOverlayClick");
		//}
	});

	//Call the extendMenu plugin on the main and user navigation. Moves overflowing links into dropdown, enables keyboard navigation to open dropdowns, and adds touch support to dropdowns
	//Default settings for all menus
	$.extendMenu({
		breakpoint: maxWidth,
		//title: "More",
		//icon: "ellipsis-horizontal",
		contentEl: '#headercenter',
		//onInit: function(){},
		//onComplete: function(){}
	});
	$headerNav.extendMenu({
		//title: "More",
		//icon: "ellipsis-horizontal",
		//contentEl: '#headertcenter',
		//maxWidth: null,
		//onInit: function(){
		//	console.log("$headerNav onInit");
		//},
		//onComplete: function(){
		//	console.log("$headerNav onComplete");
		//}
	});
	$userNav.extendMenu({
	    //title: "More",
	    //icon: "ellipsis-horizontal",
		//maxWidth: null,
	    //onInit: function(){
	    //	console.log("$userNav onInit");
	    //},
	    //onComplete: function(){
	    //	console.log("$userNav onComplete");
	    //}
	});

	//Call the 'breakpoint' function with 'resize' set to false
	breakpoint(false);
	//If media queries are supported run 'breakpoint' function when window is resized
	if (Modernizr.mq('only all')) {
		$(window).on("debouncedresize", function() {
			breakpoint(true);
		});
	}

	//Cookie Bar http://www.primebox.co.uk/projects/jquery-cookiebar/
	$.cookieBar({
		//message: "",
		policyButton: true,
		policyText: 'Cookie Policy',
		policyURL: '/cookie-usage/',
		fixed: true
	});

	//Add focus styles to btn-wrap when btn within is focused using keyboard navigation
	$('.btn-wrap').children('.btn').on('focus', function() {
		$(this).parent().addClass('focus');
	}).on('blur', function() {
		$(this).parent().removeClass('focus');
	})

	//Scroll to footer when link in it is focused (does not happen with slideout footer)
	//TODO: Detect focus on anything that can be focused
	$footer.find('a, input').on('focus', function() {
		//scrollToAnchor(this);
		$("html, body").animate({
			scrollTop: $(document).height()-$(window).height()
		}, {
			duration: 700,
			easing: "swing"
		});
	}).on('blur', function() {
		$("html, body").stop();
	});


	//Toggle the scroll to top button visibility when page is scrolled specified distance from the top
	$(window).scroll(function () {
		if ($(window).scrollTop() > 100) {
			$toTop.addClass('visible');
			if(!Modernizr.csstransitions)
				$toTop.fadeIn(800);
		} else {
			if(!Modernizr.csstransitions) {
				$toTop.fadeOut(800, function() {
					$(this).removeClass('visible');
				});
			} else
				$toTop.removeClass('visible');
		}
	});
	//Scroll back to top of the page
	$toTop.click(function(e) {
		$("html, body").animate({
			scrollTop: 0
		}, {
			duration: 700,
			easing: "swing"
		});
		return false;
	});

	//Prevent page from jumping to top when forms submitted, '#' links clicked etc.
	window.scrollTo = function() { }

	//Smooth scroll for all anchor links with a named target
	$wrapper.find('#wrapper-inner').find("a[href^='#']").not("a[href='#']").click(function() {
		scrollToAnchor($(this).attr('href'));
		return false;
	});

});

//Prevent site from being displayed inside an iframe
if (window.top !== window.self) {
    window.top.location = window.self.location;
}

//Get the width of the viewport, accounting for scrollbars
function viewportW() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window )) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return e[ a+'Width' ];
}

//Function containing events to be run on document ready, and when the window is resized
function breakpoint(resize) {
	if (viewportW() >= maxWidth) {
		if (resize) {
			//Close the off canvas menus when viewport is resized above the max width
			//Can be run on any instance of the menu, but only needs to be run once
			$leftMenu.offCanvas('closeMenu', null, null);

            footerRoom = false;
		} else {

		}

        //Css multiple columns shiv
        if (!Modernizr.csscolumns){
            if(!jQuery().columnize) {
                $.getScript('/scripts/shivs/jquery.columnizer.min.js')
                .done(function(){
                    $footerNav.find('.level1').columnize({
                        width: 120,
                        doneFunc: function() {
                             makeRoomForFooter();
                        }
                    });
                })
            }
        } else {
            makeRoomForFooter();
        }
	} else {
		if (resize) {
			//When using sticky/slideout footer, remove height from MainForm
			$footerPadEl.css('paddingBottom', '0');
		}
	}
}

//Smooth scrolling to anchors
function scrollToAnchor(url) {
	var anchorLoc = $(url).offset().top;
	var scrollAmount = anchorLoc;
	$("html, body").animate({
		scrollTop: scrollAmount + "px"
	}, {
		duration: 700,
		easing: "swing"
	});
};

//When using sticky/slideout footer, add footer's height as padding to MainForm
function makeRoomForFooter() {
    if (!footerRoom) {
        footerRoom = true;
        $footerPadEl.css('paddingBottom', function() {
            return $footer.outerHeight();
        })
    }
}

//Document clicks
//$(document).on('click', function(event) {
//	if (!$(event.target).closest('#menucontainer').length) {
//	  // Hide the menus.
//	}
//});
