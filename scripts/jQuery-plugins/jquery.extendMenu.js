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
