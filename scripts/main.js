//https://github.com/louisremi/jquery-smartresize
/*
 * debouncedresize: special jQuery event that happens once after a window resize
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery-smartresize
 *
 * Copyright 2012 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work? 
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 */
(function($) {

var $event = $.event,
	$special,
	resizeTimeout;

$special = $event.special.debouncedresize = {
	setup: function() {
		$( this ).on( "resize", $special.handler );
	},
	teardown: function() {
		$( this ).off( "resize", $special.handler );
	},
	handler: function( event, execAsap ) {
		// Save the context
		var context = this,
			args = arguments,
			dispatch = function() {
				// set correct event type
				event.type = "debouncedresize";
				$event.dispatch.apply( context, args );
			};

		if ( resizeTimeout ) {
			clearTimeout( resizeTimeout );
		}

		execAsap ?
			dispatch() :
			resizeTimeout = setTimeout( dispatch, $special.threshold );
	},
	threshold: 150
};

})(jQuery);

//http://www.primebox.co.uk/projects/jquery-cookiebar/
/*
 * Copyright (C) 2012 PrimeBox (info@primebox.co.uk)
 *
 * This work is licensed under the Creative Commons
 * Attribution 3.0 Unported License. To view a copy
 * of this license, visit
 * http://creativecommons.org/licenses/by/3.0/.
 *
 * Documentation available at:
 * http://www.primebox.co.uk/projects/cookie-bar/
 *
 * When using this software you use it at your own risk. We hold
 * no responsibility for any damage caused by using this plugin
 * or the documentation provided.
 */
(function($){
	$.cookieBar = function(options,val){
		if(options=='cookies'){
			var doReturn = 'cookies';
		}else if(options=='set'){
			var doReturn = 'set';
		}else{
			var doReturn = false;
		}
		var defaults = {
			message: 'We use cookies to track usage and preferences.', //Message displayed on bar
			acceptButton: true, //Set to true to show accept/enable button
			acceptText: 'I Understand', //Text on accept/enable button
			declineButton: false, //Set to true to show decline/disable button
			declineText: 'Disable Cookies', //Text on decline/disable button
			policyButton: false, //Set to true to show Privacy Policy button
			policyText: 'Privacy Policy', //Text on Privacy Policy button
			policyURL: '/privacy-policy/', //URL of Privacy Policy
			autoEnable: true, //Set to true for cookies to be accepted automatically. Banner still shows
			expireDays: 365, //Number of days for cookieBar cookie to be stored for
			forceShow: false, //Force cookieBar to show regardless of user cookie preference
			effect: 'slide', //Options: slide, fade, hide
			element: 'body', //Element to append/prepend cookieBar to. Remember "." for class or "#" for id.
			append: false, //Set to true for cookieBar HTML to be placed at base of website. Actual position may change according to CSS
			fixed: false, //Set to true to add the class "fixed" to the cookie bar. Default CSS should fix the position
			redirect: String(window.location.href), //Current location
			domain: String(window.location.hostname) //Location of privacy policy
		}
		var options = $.extend(defaults,options);

		//Sets expiration date for cookie
		var expireDate = new Date();
		expireDate.setTime(expireDate.getTime()+(options.expireDays*24*60*60*1000));
		expireDate = expireDate.toGMTString();

		var cookieEntry = 'cb-enabled={value}; expires='+expireDate+'; path=/'

		//Retrieves current cookie preference
		var i,cookieValue='',aCookie,aCookies=document.cookie.split('; ');
		for (i=0;i<aCookies.length;i++){
			aCookie = aCookies[i].split('=');
			if(aCookie[0]=='cb-enabled'){
    			cookieValue = aCookie[1];
			}
		}
		//Sets up default cookie preference if not already set
		if(cookieValue=='' && options.autoEnable){
			cookieValue = 'enabled';
			document.cookie = cookieEntry.replace('{value}','enabled');
		}
		if(doReturn=='cookies'){
			//Returns true if cookies are enabled, false otherwise
			if(cookieValue=='enabled' || cookieValue=='accepted'){
				return true;
			}else{
				return false;
			}
		}else if(doReturn=='set' && (val=='accepted' || val=='declined')){
			//Sets value of cookie to 'accepted' or 'declined'
			document.cookie = cookieEntry.replace('{value}',val);
			if(val=='accepted'){
				return true;
			}else{
				return false;
			}
		}else{
			//Sets up enable/accept button if required
			var message = options.message.replace('{policy_url}',options.policyURL);

			if(options.acceptButton){
				var acceptButton = '<a href="" class="cb-enable btn">'+options.acceptText+'</a>';
			}else{
				var acceptButton = '';
			}
			//Sets up disable/decline button if required
			if(options.declineButton){
				var declineButton = '<a href="" class="cb-disable btn">'+options.declineText+'</a>';
			}else{
				var declineButton = '';
			}
			//Sets up privacy policy button if required
			if(options.policyButton){
				var policyButton = '<a href="'+options.policyURL+'" class="cb-policy btn">'+options.policyText+'</a>';
			}else{
				var policyButton = '';
			}
			//Whether to add "fixed" class to cookie bar
			if(options.fixed){
				var fixed = ' class="fixed"';
			}else{
				var fixed = '';
			}

			//Displays the cookie bar if arguments met
			if(options.forceShow || cookieValue=='enabled' || cookieValue==''){
				if(options.append){
					$(options.element).append('<div id="cookie-bar"'+fixed+'><p>'+message+acceptButton+declineButton+policyButton+'</p></div>');
				}else{
					$(options.element).prepend('<div id="cookie-bar"'+fixed+'><p>'+message+acceptButton+declineButton+policyButton+'</p></div>');
				}
			}

			//Sets the cookie preference to accepted if enable/accept button pressed
			$('#cookie-bar .cb-enable').click(function(){
				document.cookie = cookieEntry.replace('{value}','accepted');
				if(cookieValue!='enabled' && cookieValue!='accepted'){
					window.location = options.currentLocation;
				}else{
					if(options.effect=='slide'){
						$('#cookie-bar').slideUp(300,function(){$('#cookie-bar').remove()});
					}else if(options.effect=='fade'){
						$('#cookie-bar').fadeOut(300,function(){$('#cookie-bar').remove()});
					}else{
						$('#cookie-bar').hide(0,function(){$('#cookie-bar').remove()});
					}
					return false;
				}
			});
			//Sets the cookie preference to declined if disable/decline button pressed
			$('#cookie-bar .cb-disable').click(function(){
				var deleteDate = new Date();
				deleteDate.setTime(deleteDate.getTime()-(864000000));
				deleteDate = deleteDate.toGMTString();
				aCookies=document.cookie.split('; ');
				for (i=0;i<aCookies.length;i++){
					aCookie = aCookies[i].split('=');
					if(aCookie[0].indexOf('_')>=0){
						document.cookie = aCookie[0]+'=0; expires='+deleteDate+'; domain='+options.domain.replace('www','')+'; path=/';
					}else{
						document.cookie = aCookie[0]+'=0; expires='+deleteDate+'; path=/';
					}
				}
				document.cookie = cookieEntry.replace('{value}','declined');
				if(cookieValue=='enabled' && cookieValue!='accepted'){
					window.location = options.currentLocation;
				}else{
					if(options.effect=='slide'){
						$('#cookie-bar').slideUp(300,function(){$('#cookie-bar').remove()});
					}else if(options.effect=='fade'){
						$('#cookie-bar').fadeOut(300,function(){$('#cookie-bar').remove()});
					}else{
						$('#cookie-bar').hide(0,function(){$('#cookie-bar').remove()});
					}
					return false;
				}
			});
		}
	}
})(jQuery);


// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "offCanvas",
			defaults = {
				copyType: 'clone',
				side: 'left',
				target: 'body',
				titleText: 'Menu',
				toggleIcon: null,
				iconOnly: false,
				hiddenClass: 'hideMenu',
				idSuffix: '-ocClone',
				pushElems: null,
				menuWidth: '80%',
				animSpeed: '400',
				levelUpIcon: 'arrow-left',
				onInit: function(){},
				onOpen: function(){},
				onClose: function(){}
			},
			$body = $('body'),
			$debug = $('#debug'),
			isInit = false, //Set to true after first initiation
			initCount = 0,
			activeMenu, //Set to the currently open menu
			activeMenuSettings,
			$target = null,
			$newEl, //Stores the elements added to the DOM
			$toggle = {}, //Stores the buttons to toggle each menu
			$elClone = {}, //Stores the cloned elements
			$finalEl = {}, //Stores the final version of each element, either cloned or original
			$pushArray, //Stores the elements to be animated when opening/closing the menus
			transEndEl = document.createElement('transEnd'),
			transEndEventNames = {
				'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
				'transition'       : 'transitionend',      // IE10, Opera, Chrome, FF 15+, Saf 7+
				'MozTransition'    : 'transitionend'       // only for FF < 15
			},
			transEndEventName,
			css3Support = false;

		// The actual plugin constructor
		function Plugin ( element, options ) {
			this.element = element;
			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		Plugin.prototype = {
			init: function () {
				// Place initialization logic here
				// You already have access to the DOM element and
				// the options via the instance, e.g. this.element
				// and this.settings
				// you can add more functions like the one below and
				// call them like so: this.yourOtherFunction(this.element, this.settings).

				var $this = this;
				var $el = $(this.element);
				var settings = this.settings;
				if ($target == null)
					$target = $(settings.target);

				if (settings.copyType != "original")
					$el.addClass(settings.hiddenClass);//Hide the original menu

				settings.onInit();

				//Get Object.keys to work in <=ie8 (http://tokenposts.blogspot.com.au/2012/04/javascript-objectkeys-browser.html)
				if (!Object.keys) Object.keys = function(o) {
					if (o !== Object(o))
						throw new TypeError('Object.keys called on a non-object');
					var k=[],p;
					for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
					return k;
				}

				//Prevent more than 3 menus from being created
				if (Object.keys($toggle).length >= 3)
					return;
				initCount++;

				//If not already initialised on another element, add elements to the DOM to hold the menu(s) and toggle(s)
				if (!isInit)
					$this._createTemplate();

				if ($elClone[settings.side] == null) {
					//Add a button to toggle the menu
					$this._addToggle();

					if (settings.copyType != "original") {
						$elClone[settings.side] = $this._cloneMenu($el);
						$finalEl[settings.side] = $elClone[settings.side];
					}
				} else {
					if (settings.copyType != "original")
						$this._cloneMenu($el);
				}
				if (settings.copyType == "original") {
					$el.addClass('offCanvasMenu offCanvasOriginal ' + 'offCanvas-' + settings.side);
					$finalEl[settings.side] = $el;
				}

				//Disable CSS tranforms and transitions (for edge cases of Modernizr returning a false negative, in which case both transition methods would be applied)
				if(css3Support){
					$pushArray.add($finalEl[settings.side]).add($target.find('ul')).addClass('disableTranslate');
					if (settings.copyType == "original")
						$el.addClass('disableTranslate');
				}

				//Toggle Menu
				$toggle[settings.side].toggle.off().on('click', function() {
					$this._toggleMenu();
					return false;
				})

				//Open sub-levels
				if ($finalEl[settings.side] != null) {
					$finalEl[settings.side].find('.showChildren').off().on('click', function(e) {
						var $ul = $(this).parent().siblings('ul');
						if(css3Support) {
							$ul.animate({
								left: "0"
							}, parseInt(settings.animSpeed));
						}
						//Add a class of 'active' to this level
						$ul.addClass('active').parents('ul').first().addClass('parentLevel');

						var level = parseInt($(this).parentsUntil($target,'ul').length);
						$body.removeClass("active" + level).addClass("active" + (level + 1));

						e.stopPropagation();
						return false;
					});

					//Close sub-level
					$finalEl[settings.side].find('.upalevel').children('i').off().on('click', function(e) {
						var $ul = $(this).closest('ul');
						if(css3Support) {
							$ul.animate({
								left: "100%"
							}, parseInt(settings.animSpeed), function() {
								$ul.removeClass('active').parents('ul').first().removeClass('parentLevel');
							});
						} else
							$ul.removeClass('active').parents('ul').first().removeClass('parentLevel');

						var level = parseInt($(this).parentsUntil($target,'ul').length);
						$body.removeClass("active" + level).addClass("active" + (level - 1));

						e.stopPropagation();
						return false;
					});
				}

				//Close menu when 'menu-overlay' or menu holder element clicked/touched (can be either depending on z-index of menu holder)
				$body.find('.menu-overlay').add($newEl.menus).off().on('click touchend', function(e) {
					if (activeMenu != null)
						$this.closeMenu(activeMenu, activeMenuSettings);
					e.stopPropagation();
				})
				//Prevent menu(s) from being closed when anything within is clicked/touched
				$newEl.menus.children().on('click touchend', function(e) {
					e.stopPropagation();
				})
			},

			//Add elements to the DOM to hold the menu(s) and toggle(s)
			_createTemplate: function() {
				var $this = this;
				var settings = this.settings;

				//Create the elements: menu toggle holder, menu holder, content overlay
				$newEl = {
					toggles : $("<div>", {"id": "offCanvasToggles", "class": "offCanvasToggles"}),
					menus : $("<div>", {"id": "offCanvasMenus", "class": "offCanvasMenus"}),
					overlay : $("<div>", {"class": "menu-overlay"})
				};

				//If the setting 'pushElems' is blank, or the element doesn't exist, use the element immediately after the target element
				var $pushTemp;
				if (settings.pushElems == null || settings.pushElems == "" || $(settings.pushElems).length < 1)
					$pushTemp = $target.next();
				else
					$pushTemp = $(settings.pushElems);

				//Store the content and menu elements to a variable, to be animated
				$pushArray = $pushTemp.add($newEl.menus);

				//Add the overlay element to the content element(s)
				$pushTemp.prepend($newEl.overlay);

				//Add the menu holder to the target element
				$target.prepend($newEl.menus);

				//Add the toggle holder to the target element
				$target.prepend($newEl.toggles);

				//Set to true so this is not executed with subsequent initialisations
				isInit = true;

				for (var name in transEndEventNames) {
					if (transEndEl.style[name] !== undefined) {
						transEndEventName = transEndEventNames[name];
						//transEndEl.remove();
						break;
					}
				}

				if(!Modernizr.csstransforms3d || !Modernizr.csstransitions)
					css3Support = true;
			},

			//Clone the selected menu
			_cloneMenu: function($el) {
				var $this = this;
				var settings = this.settings;

				//Check if this menu already initiated a non-nav element
				var menuExistsWithoutNav = false;
				if ($elClone[settings.side] != null) {
					if ($elClone[settings.side].get(0).tagName.toLowerCase() != "nav") {
						menuExistsWithoutNav = true;
					}
				}

				if ($elClone[settings.side] == null || menuExistsWithoutNav) {
					//console.log("settings.side[" + settings.side + "] == null");
					var $clone = $el.clone(); //Create a clone of the element and store in a variable
					//Modify the id, remove the hidden class, add new classes, and disable tab navigation to the cloned element
					$clone.attr('id', $clone.attr('id') + settings.idSuffix + "-" + settings.side)
						.removeClass(settings.hiddenClass)
						.addClass("offCanvasMenu " + (!menuExistsWithoutNav ? "offCanvas-" + settings.side : "") + (settings.move ? " move" : " clone"))
						.find('ul').first().addClass('firstLevel')
						.find('a').attr('tabindex', '-1');

                    //Modify id's from all elements within the cloned menu so there are no duplicates
                    $clone.find('*[id]').each(function() {
						$(this).attr('id', $(this).attr('id') + settings.idSuffix + "-" + settings.side);
					});

					$this._addLevelUp($clone, true);

					//Option to remove the original
					if (settings.copyType == "move")
						$el.remove();

					//Append the clone to the menu holder
					var appendTo = $newEl.menus;
					if (menuExistsWithoutNav)
						appendTo = $newEl.menus.children(".offCanvas-" + settings.side);
					$clone.appendTo(appendTo);

					return $clone;
				} else {
					//console.log("settings.side[" + settings.side + "] != null");
					var $clone = $el.find('ul').first().clone();

					$clone.find('a').attr('tabindex', '-1');

					//Modify id's from all elements within the cloned menu so there are no duplicates
					$clone.find('*[id]').each(function() {
						$(this).attr('id', $(this).attr('id') + settings.idSuffix + "-" + settings.side);
					});

					$this._addLevelUp($clone, false);

					//If set to move instead of clone, remove the original element
					if (settings.copyType == "move")
						$el.remove();

					var $parent = $elClone[settings.side].find('ul').first();
					$parent.append("<li class=\"title\">" + settings.titleText + "</li>");

					$clone.children('li').appendTo($parent);
				}
			},

			_addLevelUp: function($m, skipfirst) {
				var settings = this.settings;

				$uls = skipfirst ? $m.find('ul').find('ul') : $m.find('ul');
				$uls.each(function() {
					parentName = $(this).siblings('a').children('.middle').html();
					$(this).prepend("<li class=\"upalevel\"><i class=\"im icn-" + (settings.levelUpIcon != "" ? settings.levelUpIcon : "arrow-left") + "\" aria-hidden=\"true\"></i><span class=\"childrenof\">" + parentName + "</span></li>");
				});
			},

			//Add a button to toggle the menu
			_addToggle: function() {
				var $this = this;
				var settings = this.settings;

				//Create the toggle button, containing icon and text
				var iconElem = settings.toggleIcon != null ? $("<i>", {"class": "icon im icn-" + settings.toggleIcon}) : $("<span>", {"class": "icon burgercross"});
				$toggle[settings.side] = {
					toggle: $("<a>", {"id": settings.side, "class": "menuToggle " + settings.side + "Toggle"}),
						//icon: $("<i>", {"class": "im icn-" + settings.toggleIcon}),
                        icon: iconElem,
						text: $("<span>", {"class": "text"})
				}

				if (settings.toggleIcon == null)
					$toggle[settings.side].icon.html("<span></span>");
				//Set the text content of the button
				$toggle[settings.side].text.html("<span class=\"inner\">" + settings.titleText + "</span>");
				//Add the icon element to the toggle
				$toggle[settings.side].toggle.append($toggle[settings.side].icon);
				//Add the text element to the toggle
				if (settings.iconOnly && $toggle[settings.side].text != null)
					$toggle[settings.side].toggle.attr('title', settings.titleText).addClass('icon-only');
				else if ($toggle[settings.side].text != "")
					$toggle[settings.side].toggle.append($toggle[settings.side].text);

				//Add the toggle element to the toggle holder
				$newEl.toggles.append($toggle[settings.side].toggle);
			},

			//Toggle the menu(s)
			_toggleMenu: function() {
				var $this = this;

				//If none are open, then open the selected menu
				if (activeMenu == null) {
					$this._openMenu($this, $this.settings);
				} else if (activeMenu != null && activeMenu != $this) { //Open another menu when one is already open
					//Close the active menu
					$this.closeMenu(activeMenu, activeMenuSettings, function() {
						//Open the selected menu after the active one has closed
						$this._openMenu($this, $this.settings);
					});
				} else { //Close active menu
					$this.closeMenu(activeMenu, activeMenuSettings);
				}
			},

			//Open the selected menu
			_openMenu: function($t, s) {
				var $this, settings;
				if ($t != null) {
					$this = $t;
					settings = s;
				} else {
					$this = this;
					settings = this.settings;
				}

				//Set the activeMenu to this menu
				activeMenu = $this;
				activeMenuSettings = settings;

				//Add a class to the body, which is all that's required to initiate css transitions
				$body.addClass("menuOpen " + $this.settings.side + 'Menu' + (settings.copyType == "original" ? " originalOpen" : " clonedOpen"));
				//Add a class to the toggle button, for the icon animation
				$toggle[settings.side].toggle.addClass("open");

				settings.onOpen();

				//If css transitions/translate aren't supported, use jQuery animate to open the menu
				if(css3Support){
					var options = {};
					var animValue = $this.settings.menuWidth;
					if ($this.settings.side == "left")
						options['marginLeft'] = animValue;
					else if ($this.settings.side == "right")
						options['marginLeft'] = "-" + animValue;
					else if ($this.settings.side == "center") {
						var $el = $($this.element), height = $el.outerHeight() * -1;
						$el.css({ "bottom": "auto", "top": height });

						options['top'] = "0";

						$($this.element).animate(options, parseInt($this.settings.animSpeed));
						return;
					}

					$pushArray.animate(options, parseInt($this.settings.animSpeed));
				}
			},

			//Close the active menu
			closeMenu: function ($t, s, callback) {
				var $this, settings;
				if ($t != null) {
					$this = $t;
					settings = s;
				} else {
					$this = this;
					settings = this.settings;
				}

				//Remove the class from the body tag
				$body.removeClass('menuOpen leftMenu rightMenu centerMenu clonedOpen originalOpen');
				//Add a class from the toggle button, for the icon animation
				$toggle[settings.side].toggle.removeClass("open");

				//If css transitions/translate aren't supported, use jQuery animate to close the menu
				if(css3Support) {
					var options = {};
					var $animEls;

					if (settings.side == "center") {
						$animEls = $($this.element);
						options['top'] = $animEls.outerHeight() * -1;
					} else {
						$animEls = $pushArray;
						options['marginLeft'] = 0;
					}

					$animEls.animate(options, parseInt(settings.animSpeed)).promise().done(function() {
						//Close the sub-levels once the animation is complete
						$this._closeSubLevels();

						//Reset the active menu to null
						activeMenu = null;
						activeMenuSettings = null;

						//If a callback is in the function call, run it
						if (callback) {
							callback();
						}
						settings.onClose();
					});
				} else { //If css transitions/translate are supported
					if (settings.copyType != "original") {
						//Wait for the css transition of the menu closing to finish
						$target.one(transEndEventName, function() {
							//Close the sub-levels
							$this._closeSubLevels();

							//Reset the active menu to null
							activeMenu = null;
							activeMenuSettings = null;

							//If a callback is in the function call, run it
							if (callback) {
								callback();
							}
							settings.onClose();
						});
					} else {
						//Close the sub-levels
						$this._closeSubLevels();

						//Reset the active menu to null
						activeMenu = null;
						activeMenuSettings = null;

						//If a callback is in the function call, run it
						if (callback) {
							callback();
						}
						settings.onClose();
					}
				}

			},

			//Find all active sub-levels and close them
			_closeSubLevels: function() {
				var $active = $finalEl[this.settings.side].find('.active');
				$active.removeClass('active');
                $active.parents('.parentLevel').first().removeClass('parentLevel');
				$body.removeClass('active1 active2 active3 active4');
				//If css transitions/translate aren't supported, use jQuery animate to close them
				if(css3Support){
					$active.css('left', '100%');
				}
			}
		};

		$[pluginName] = $.fn[ pluginName ] = function ( options ) {
			var args = arguments;

			if (options === undefined || typeof options === 'object') {
				if(!(this instanceof $)) { $.extend(defaults, options) }
				else {
					return this.each(function () {
						if (!$.data(this, "plugin_" + pluginName)) {
							$.data(this, "plugin_" + pluginName, new Plugin(this, options));
						}
					});
				}
			} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
				var returns;

				this.each(function () {
					var instance = $.data(this, 'plugin_' + pluginName);

					// Tests that there's already a plugin-instance
					// and checks that the requested public method exists
					if (instance instanceof Plugin && typeof instance[options] === 'function') {

						// Call the method of our plugin instance,
						// and pass it the supplied arguments.
						returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
					}

					// Allow instances to be destroyed via the 'destroy' method
					//if (options === 'destroy') {
					//	$.data(this, 'plugin_' + pluginName, null);
					//}
				});

				return returns !== undefined ? returns : this;
			}
		};

})( jQuery, window, document );


// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variable rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "extendMenu",
			defaults = {
                breakpoint: 980,
				title: "More",
				icon: "ellipsis",
                contentEl: null,
				maxWidth: null,
				onInit: function(){},
				onComplete: function(){}
			},
			$menuItemTemplate = {},
			$menu = {},
			constructed = {},
            pageLoaded = false;

		// The actual plugin constructor
		function Plugin ( element, options ) {
			this.element = element;
			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		Plugin.prototype = {
			init: function () {
				// Place initialization logic here
				// You already have access to the DOM element and
				// the options via the instance, e.g. this.element
				// and this.settings
				// you can add more functions like the one below and
				// call them like so: this.yourOtherFunction(this.element, this.settings).
				var $this = this, $el = $(this.element), settings = this.settings;

				//Hide any menu items which overflow from first row
				//$el.css({'overflow': 'hidden', 'height': initHeight});

				//settings.onInit();

                $this.pageResizing();
                if (Modernizr.mq('only all')) {
                    $(window).on("debouncedresize", function() {
                        $this.pageResizing();
                    });
                }

				//Wait for the page to load, as unloaded images or fonts in the menu will affect width calculations
				$(window).load(function() {
                    pageLoaded = true;
                    if ($this.viewportWidth() >= settings.breakpoint) {
				        $this.construct();
                    }
				});


			},

            pageResizing: function() {
                var $this = this, $el = $(this.element), settings = this.settings, menuId = $el.attr('id'), initHeight = $el.find('li').first().outerHeight(true), menuId = $el.attr('id');

                if ($this.viewportWidth() >= settings.breakpoint) {
                    //Hide any menu items which overflow from first row
                    if (!constructed[menuId])
				        $el.css({'overflow': 'hidden', 'height': initHeight});

				    settings.onInit();

                    if (constructed[menuId] == null)
                        constructed[menuId] = false;

                    //If plugin is called after the page has loaded
                    if (!constructed[menuId] && pageLoaded) {
                        $this.construct();
                    }
                } else {
                    $el.css({'overflow': 'visible', 'height': 'auto'});
                }
            },

			construct: function() {
				var $this = this, $el = $(this.element), settings = this.settings, menuId = $el.attr('id');

				//Create a template for the extended menu item
				$this.createMenuItemTemplate();

				//Move excessive menu items into a new dropdown
				$menu[menuId].append($this.excessItems());

				//Reset the css used to hide the overflow
				$el.css({'overflow': 'visible', 'height': 'auto'});

                constructed[menuId] = true;

				settings.onComplete();

				//Enable keyboard tab navigation to use the dropdown menu
				//(http://uablogs.missouri.edu/interface/2011/08/keyboard-accessible/)
				$el.find('a').focus(function() {
					$(this).parents('li').addClass("emhover");
				}).blur(function() {
					$(this).parents('li').removeClass("emhover");
				});

				//Modify the dropdown menu to work on touch screens
				if(Modernizr.touch) {
					//Select all menu items which have a sub-menu, except for the extended menu item
					$el.find('li').not('.excessLinks').has('> ul').each(function() {
						//If it doesn't exist already, clone the parent menu item and place it at the top of the level below, so touch users can still access the parent link when the parent itself's link is disabled
						if ($(this).find('.cloned').length < 1) {
							//Only clone the link if the href is not "#"
							if ($(this).children('a').attr('href')!="#") {
								var $clone = $(this).clone();
								$clone.addClass('cloned').children('ul').add($clone.children('a').children('.right')).remove();
								$(this).children('ul').prepend($clone);
							}
						}
					}).on('click', function() {return false}); // Prevent the parent click from navigating to the href

					//Allow links on lower levels to behave normally
					$el.find('ul').on('click', function(e) {
						e.stopPropagation();
					});
				}
			},

			//Create a template for the extended menu item
			createMenuItemTemplate: function() {
				var $el = $(this.element), settings = this.settings, menuId = $el.attr('id');

				//Find the first ul and store it in a global variable
				$menu[menuId] = $el.find('ul').first();

				//Find the first li in the stored menu, and store it as the item template
				$menuItemTemplate[menuId] = $($menu[menuId].children('li').first().clone());
				//Add necessary classes, and remove uncessary ones
				$menuItemTemplate[menuId].addClass('hasIcon hasChildren rightAligned excessLinks').removeClass('current parent');

				//If the item contains a sub-level, remove it
				if ($menuItemTemplate[menuId].find('ul').length > 0)
					$menuItemTemplate[menuId].find('ul').remove();

				//Remove classes and href from the link
				$menuItemTemplate[menuId].children('a').removeClass('current parent').removeAttr('href');
				//Remove the dropdown arrow element
				$menuItemTemplate[menuId].find('.right').remove();
				//Add the title text and hide it (visuall hidden, but not from screen readers)
				$menuItemTemplate[menuId].find('.middle').text(settings.title).addClass('hidden');
				//If the icon element already exists, replace existing icon, otherwise create the element
				if ($menuItemTemplate[menuId].find('.left').children('i').length > 0)
					$menuItemTemplate[menuId].find('.left').children('i').removeClass().addClass('im icn-' + settings.icon);
				else if ($menuItemTemplate[menuId].find('.left').length > 0)
					$menuItemTemplate[menuId].find('.left').html('<i class="im icn-' + settings.icon + '" aria-hidden="true"></i>');
                else
                    $menuItemTemplate[menuId].children('a').html('<span class="left"><i class="im icn-' + settings.icon + '" aria-hidden="true"></i></span>');
			},

			//Measure the width of the extended menu item
			measureExtendItem: function() {
				var $this = this, $el = $(this.element), settings = this.settings, menuId = $el.attr('id');

				//Temporarily append the template to the menu
				$menu[menuId].append($menuItemTemplate[menuId]);
				//Store the temp item / Measure the width of the temp item
				var $tempExtendItem = $menu[menuId].children('li').last(), width = $tempExtendItem.outerWidth(true);

				//$tempExtendItem.outerWidth(true);
				//Remove the temp item
				$tempExtendItem.remove();

				//Return the width
				return width;
			},

			//Move all overflowing menu items to the new dropdown
			excessItems: function() {
				var $this = this, $el = $(this.element), settings = this.settings, i = 1, hasExcess = false, menuId = $el.attr('id');

				var totalItems = $menu[menuId].children('li').length; //Count the number of menu items
				var totalWidth = 0;
				var menuWidth = settings.maxWidth != null && settings.maxWidth > 0 ? settings.maxWidth : $(this.element).outerWidth(true); //Get menu width
				var extendItemWidth = $this.measureExtendItem(); //Measure the width the extended menu item would be by temporarily adding it to the DOM
				var dropWidth = 0;
				if ($menu[menuId].children('li').has('ul').length > 0)
					dropWidth = $menu[menuId].children('li').has('ul').first().children('ul').outerWidth();

				//Add the item template to a variable
				var $overflow = $menuItemTemplate[menuId];

				//Create the second level ul
				var extendUl = $('<ul class="level2"></ul>');

                //If 'contentEl' is set, get it's width, otherwise use the menu width
                var visibleWidth = settings.contentEl != null && $(settings.contentEl).length > 0 ? $(settings.contentEl).outerWidth(false) : menuWidth;
				//Loop through each top level menu item
				$menu[menuId].children('li').each(function() {
					totalWidth += $(this).outerWidth(true); //Add each item's width to the total width
					var pos = $(this).position(); //Get the item's position relative to the menu container

					//Count the number of child levels
					var childLevelCount = 0;
					if ($(this).children('ul').length > 0) {
						var maxLevels = 1;
						$(this).find('ul:not(:has(ul))').each(function() {
							if ($(this).parentsUntil(menuId, 'ul').size() > maxLevels)
								maxLevels = $(this).parentsUntil(menuId, 'ul').size();
						});
						childLevelCount = maxLevels;
					}

					//If the current total width and width of the 'More' item is greater than the menu width, move the item into the 'More' item
					if ((i < totalItems && totalWidth + extendItemWidth > menuWidth) || (i == totalItems && totalWidth > menuWidth)) {
						hasExcess = true;
						if ($(this).hasClass('current') && !$overflow.hasClass('current'))
							$overflow.add($overflow.children('a')).addClass('current');
						if ($(this).hasClass('parent') && !$overflow.hasClass('parent'))
							$overflow.add($overflow.children('a')).addClass('parent');
						extendUl.append($(this).clone());
						$(this).remove(); //Remove the original copy of the item
					} else if (pos.left + (dropWidth * childLevelCount) > visibleWidth) {
						//If the item's position would cause the maximum No. of dropdowns to go offscreen, add the 'rightAligned' class to make them expand to the left
						$(this).addClass('rightAligned');
					}
					i++;
				});

				//Increase the level class names of each extended item
				extendUl.find('ul').each(function() {
					var currentClass = $(this).attr('class');
					var className = currentClass.replace(/[0-9]/g, "");
					var currentLevel = currentClass.replace(/[A-Za-z$-]/g, "");
					$(this).removeClass(currentClass).addClass(className + (parseInt(currentLevel) + 1).toString());
				})

				//Add the extended menu ul to the extended menu item
				$overflow.append(extendUl);

				//Only return the extended menu if there are overflowing items
				if (hasExcess)
					return $overflow;
				else
					return null;
			},

            //Get the width of the viewport, accounting for scrollbars
            viewportWidth: function() {
                var e = window, a = 'inner';
                if (!('innerWidth' in window )) {
                    a = 'client';
                    e = document.documentElement || document.body;
                }
                return e[ a+'Width' ];
            }
		};

		$[pluginName] = $.fn[ pluginName ] = function ( options ) {
			var args = arguments;

			if (options === undefined || typeof options === 'object') {
				if(!(this instanceof $)) { $.extend(defaults, options) }
				else {
					return this.each(function () {
						if (!$.data(this, "plugin_" + pluginName)) {
							$.data(this, "plugin_" + pluginName, new Plugin(this, options));
						}
					});
				}
			} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
				var returns;

				this.each(function () {
					var instance = $.data(this, 'plugin_' + pluginName);

					// Tests that there's already a plugin-instance
					// and checks that the requested public method exists
					if (instance instanceof Plugin && typeof instance[options] === 'function') {

						// Call the method of our plugin instance,
						// and pass it the supplied arguments.
						returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
					}

					// Allow instances to be destroyed via the 'destroy' method
					//if (options === 'destroy') {
					//	$.data(this, 'plugin_' + pluginName, null);
					//}
				});

				return returns !== undefined ? returns : this;
			}
		};

})( jQuery, window, document );


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

