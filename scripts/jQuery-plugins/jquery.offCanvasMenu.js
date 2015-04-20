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
