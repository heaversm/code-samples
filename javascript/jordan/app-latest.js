//a large format Kiosk bundled as an electron app using the javascript game engine Pixi.js for performance
//note that this is the entire compiled source and the original app was componentized into separate files

;(function(namespace) {
    'use strict';

    if (typeof(require) != "undefined"){
        const {ipcRenderer} = require('electron');
        ipcRenderer.on('toggleIdle', (event, isChecked) => {

            if (isChecked){
                Constants.MOUSE_IDLE_INTERVAL2 = 60 * 1000;
                Constants.MOUSE_IDLE_INTERVAL3 = 90 * 1000;
            } else {
                Constants.MOUSE_IDLE_INTERVAL2 = 30 * 1000;
                Constants.MOUSE_IDLE_INTERVAL3 = 60 * 1000;
            }

        });
        ipcRenderer.on('toggleResponsiveTouch', (event, isChecked) => {

            if (isChecked){
                Constants.TOUCH_SENSITIVITY = 2;
            } else {
                Constants.TOUCH_SENSITIVITY = 1;
            }
        });
    }

    var UA        = navigator.userAgent,
        isLocal   = /localhost$/.test(location.hostname),
        isChrome  = /chrome/i.test(UA),
        isWindows = /windows/i.test(UA),

        Flags = namespace.Flags = {
            isLocal     : isLocal,
            isWindows   : isWindows,
            isTouch     : 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
            isElectron  : location.host == "" || (typeof module === "object" && typeof module.exports === "object"),
            // isTileFudged: isSafariMac || isFirefox || isIE,  // On these browsers, tile seams are visible when zoomed.
            isDebug      : location.href.indexOf('debug') > 1,
            noSound      : location.href.indexOf('no-sound') > 1,
            sceneIntro   : location.href.indexOf('scene-intro') > 1,
            sceneGrid    : location.href.indexOf('scene-grid') > 1,
            sceneMain    : location.href.indexOf('scene-main') > 1,
            showArrows   : location.href.indexOf('show-arrows') > 1,
            useDebugPanel: true
        },

        Colors = namespace.Colors = {
            ACTION      : { background: "#c39",    color: "#fff" },
            ASSETS      : { background: "#00587e", color: "#fff" },
            ASSETS_LIGHT: { background: "#00587e", color: "#ccc" },
            CRITICAL    : { background: "#f00",    color: "#fff" },
            DEBUG       : { background: "#0E5342", color: "#93d9c7" },
            IMPORTANT   : { background: "#ff0",    color: "#f0f" },
            LAYERS      : { background: "#e2eea9", color: "#708410" },
            ANIMATION   : { background: "#2099cd", color: "#fff" },
            RELEASEASSET: { background: "#f3c",    color: "#fff" },
            SCENE       : { background: "#9cf",    color: "#333" },
            SCENECHANGE : { background: "#3cf",    color: "#333" },
            SOCKET      : { background: "#81de90", color: "#333" },
            MOUSE       : { background: "#003300", color: "#66FF66" },

            BLACK : 0x0,
            WHITE : 0xffffff,
            GOLD  : 0xbd9b59,
            BLUE  : 0x24bcd8,
            PURPLE: 0xc86cac,
            RED   : 0xf46c6c,
            YELLOW: 0xebde66,

            HEX_BLACK : "#000000",
            HEX_WHITE : "#ffffff",
            HEX_RED   : "#f46c6c",
            HEX_BLUE  : "#24bcd8",
            HEX_GOLD  : "#bd9b59",
            HEX_PURPLE: "#c86cac",
            HEX_YELLOW: "#ebde66"
        },

        Constants = namespace.Constants = {
            DATA_HOST : ( Flags.isElectron ? "" : "" ) + 'data',
            FONT_HOST : ( Flags.isElectron ? "" : "" ) + 'font',
            IMAGE_HOST: ( Flags.isElectron ? "" : "" ) + 'image',

            // Image file paths
            IMAGE_SUBPATH: Flags.isElectron ? "/medium" : "/thumbs",
            IMAGE_THUMBPATH: "/thumbs",
            // IMAGE_SUBPATH: Flags.isElectron ? "" : "/medium",

            // RENDERER: Flags.isElectron ? 'auto' : 'canvas',

            /**
             * using the canvas renderer creates artifacts around the
             * caption box going from black -> gold, but also messes up
             * animating the jump man logo.
             */
            RENDERER: 'auto',

            // Numeric constants
            RAD_TO_DEG: 180 / Math.PI,
            DEG_TO_RAD: Math.PI / 180,
            PI        : Math.PI,
            TWO_PI    : Math.PI * 2,
            PI_2      : Math.PI / 2,
            PI_4      : Math.PI / 4,

            //Font Variables
            LANGUAGE: 'ENG', //ENG (English), CNS (Chinese Simplified), or CNT (Chinese Traditional)
            FONT_SHOE_DESCRIPTION: 'Jordan NHG Disp 55 Roman', //primary font for shoe description
            FONT_SHOE_DESCRIPTION_2: 'Jordan NHG Disp 55 Roman', //other languages will require that some words be printed in english, thus the second font here
            SHOE_DATA_FILE: 'shoes.json', //other languages will use other data files

            //Performance Testing Variables
            SHADOWS: false, //render shadows?
            BG: true, //render BGs?
            SINGLE_EASE: false, //use a single ease method for all animations?
            EASE: 'linear', //use this ease method if SINGLE_EASE  is true.  Otherwise, use whatever ease method is specified in the animate method for the particular animation
            ANIMATE_BOX: true,
            RETINA: false,
            DO_ANIMATE: 1, //0 = false, 1 = true - sets animation durations to zero false - //MH - not working
            USE_JPG: false, //JPG vs PNG images
            SHOES_FORMAT: 'png', //png or jpg - even if use JPG is set to true, we can render the shoes themselves as PNGs
            FXAA: false,
            ANTIALIAS: false,
            // Rate at which calculations occur and independent animations update
            TARGET_FPS       : 60,
            ANIM_FRAMERATE   : 60,
            ANIM_INTERVAL    : 1000 / 60,
            MAX_ANIM_INTERVAL: 1000 / 30,

            //GRID ICON VARIABLES
            GRID_BOX_SIZE: 10, //px size of each grid square
            GRID_BOX_SPACE: 3, //px space between each box
            GRID_BOX_HIT: 3, // # of times larger than grid hit area is (i.e 3x larger)

            // Health check variables
            ENABLE_HEALTH_CHECKS : false,
            HEALTH_CHECK_INTERVAL: 30 * 1000,
            MAX_TICK_AMOUNT      : 60 * 4 * 1000,  // roughly an hour (each 1000 is about 15sec)
            MIN_FRAMERATE        : 60,

            // Minimum mouse polling rate (hz)
            // 125hz == 8ms, 500hz == 4ms, 1000 == 1ms
            MIN_MOUSE_SAMPLE_RATE: 50,
            TOUCH_SENSITIVITY: 1, //higher the number, the more the carousel will scroll with each swipe //MH - orig was 2

            // Mouse Idle
            ALLOW_IDLE_SCENE_CHANGE: true,
            MOUSE_IDLE_INTERVAL1: 5 * 1000,
            // MOUSE_IDLE_INTERVAL2: 10 * 1000,
            MOUSE_IDLE_INTERVAL2: 30 * 1000,
            // MOUSE_IDLE_INTERVAL3: 20 * 1000,
            MOUSE_IDLE_INTERVAL3: 60 * 1000,

            // Scaling & viewport dimensions
            // dynamic scaling will calculate scale instead of using fixed below
            DYNAMIC_SCALING: false,
            VIEWPORT_HEIGHT: window.innerHeight,
            VIEWPORT_WIDTH : window.innerWidth,
            VIEWPORT_SCALE : 1,

            SOUND_PLAY   : 'play',
            SOUND_STOP   : 'stop',
            SOUND_PAUSE  : 'pause',
            SOUND_FADEIN : 'fadeIn',
            SOUND_FADEOUT: 'fadeOut',

            // Animation
            ANIMATION_DURATION: 250,

            // Scenes
            SCENE_BOOT: 'scene:boot',
            SCENE_MENU: 'scene:menu',
            SCENE_MAIN: 'scene:main',

            // Don't have M4A audio files yet.
            AUDIO_FORMAT: '.mp3',


        },

        Events = namespace.Events = {
            ABORT          : 'abort',
            ANIMATE_IN        : 'animateIn',
            ANIMATE_OUT       : 'animateOut',
            ANIMATION_END  : 'animation:end',
            CLICK          : 'click',
            CLICK_LAYER    : 'pixi:click',
            COMPLETE       : 'complete',
            GAME_COMPLETE  : 'game:complete',
            GAME_INIT      : 'game:init',
            GAME_RESET     : 'game:reset',
            GAME_START     : 'game:start',
            GAME_STOP      : 'game:stop',
            LOADED         : 'loaded',
            LOCK_SHOE      : 'shoe:lock',
            HEARTBEAT      : 'heartbeat',

            CAROUSEL_X       : 'carousel:x',
            CAROUSEL_NEXT    : 'carousel:next',
            CAROUSEL_PREVIOUS: 'carousel:previous',

            MOUSE_IDLE     : 'mouse:idle',

            OUTRO_START    : 'outro:start',

            PROGRESS       : 'progress',

            RENDER_REQUEST : 'render:request',
            RENDER_CHECKIN : 'render:checkin',
            RENDER_CONFIRM : 'render:confirm',
            RENDERER_HIDE  : 'renderer:hide',
            RENDERER_SHOW  : 'renderer:show',

            REPLAY         : 'replay',
            RESIZE         : 'resize',

            SCENE_ACTION   : 'scene:action',
            SCENE_CHANGE   : 'scene:change',
            SCENE_REQUEST  : 'scene:request',
            SCENE_RENDER   : 'scene:render',
            SCENE_UPDATE   : 'scene:update',
            SCENE_SELECT   : 'scene:select',
            SCENE_START    : 'scene:start',

            SOUND_PLAY     : 'play',
            SOUND_STOP     : 'stop',
            SOUND_PAUSE    : 'pause',
            SOUND_FADEIN   : 'fadeIn',
            SOUND_FADEOUT  : 'fadeOut',
            SOUND_KILLALL  : 'kill',
            SOUND_FADEOUTALL: 'killFadeOut',

            TRIGGER        : 'trigger',
            VIDEO_START    : 'video:start',
            ZOOM           : 'zoom'
        },

        // State ______________________________________________________________

        State = namespace.State = {
            currentViewportWidth : Constants.VIEWPORT_WIDTH,  // Canvas tag width
            currentViewportHeight: Constants.VIEWPORT_HEIGHT, // Canvas tag height
            currentScale: 1.0,

            isAnimating: false,
            isCountdown: false,
            isFocused  : true,
            isRunning  : false,
            isPaused   : false,

            carouselX: 0,
            carouselDX: 0,
            carouselRatioX: 0,
            carouselRatioDX: 0,
            lastLockedIndex: 1,

            // set by renderer, +1
            tick: 0,

            // set by renderer, date.now()
            time: Date.now(),

            // custom debug variables
            debug: [],

            // mouse position
            mouse: {
                down    : false,
                x       : 0,
                y       : 0,
                ratioX  : 0,
                ratioY  : 0,
                startX  : 0,
                startY  : 0,
                endX    : 0,
                endY    : 0,
                diffX   : 0,
                diffY   : 0,
                inertiaX: 0,
                inertiaY: 0
            },

            gridShoes: []
        },

        URLParams = namespace.URLParams = $.deparam( location.href.split('?')[1] || '' )
    ;

    Constants.TOUCH_SENSITIVITY = parseFloat(URLParams.sensitivity) || Constants.TOUCH_SENSITIVITY;
    //Constants.VIEWPORT_SCALE = State.currentScale = parseFloat(URLParams.scale) || Constants.VIEWPORT_SCALE;
    Constants.VIEWPORT_SCALE = State.currentScale = parseFloat(URLParams.scale) || Constants.RETINA ? .5 : 1;

    //Language Params //MH - uncomment this block to switch dynamically between languages using URL params
    Constants.LANGUAGE = URLParams.lang || Constants.LANGUAGE;
    switch (Constants.LANGUAGE){
        case 'ENG':
            Constants.FONT_SHOE_DESCRIPTION = 'Jordan NHG Disp 55 Roman';
            Constants.FONT_SHOE_DESCRIPTION_2 = 'Jordan NHG Disp 55 Roman';
            Constants.SHOE_DATA_FILE = 'shoes.json';
            break;
        case 'CNS':
            Constants.FONT_SHOE_DESCRIPTION = 'Adobe Heiti Std R Bold';
            Constants.FONT_SHOE_DESCRIPTION_2 = 'Flama Basic';
            Constants.SHOE_DATA_FILE = 'shoes-chinese-simplified.json';
            break;
        case 'CNT':
            Constants.FONT_SHOE_DESCRIPTION = 'DFLi Heiti Std W5';
            Constants.FONT_SHOE_DESCRIPTION_2 = 'Jordan NHG Disp 55 Roman';
            //Constants.FONT_SHOE_DESCRIPTION_2 = 'Flama Basic';
            Constants.SHOE_DATA_FILE = 'shoes-chinese-traditional.json';
            break;
        default:
            Constants.FONT_SHOE_DESCRIPTION = 'Jordan NHG Disp 55 Roman';
            Constants.FONT_SHOE_DESCRIPTION_2 = 'Jordan NHG Disp 55 Roman';
            Constants.SHOE_DATA_FILE = 'shoes.json';
            break;
    }

    //MH - for static language declarations when bundling, use one of the following

    //Chinese traditional
    Constants.LANGUAGE = 'CNT';
    Constants.FONT_SHOE_DESCRIPTION = 'DFLi Heiti Std W5';
    Constants.FONT_SHOE_DESCRIPTION_2 = 'Jordan NHG Disp 55 Roman';
    Constants.SHOE_DATA_FILE = 'shoes-chinese-traditional.json';

/*    //Chinese simplified
    Constants.LANGUAGE = 'CNS';
    Constants.FONT_SHOE_DESCRIPTION = 'Adobe Heiti Std R Bold';
    Constants.FONT_SHOE_DESCRIPTION_2 = 'Flama Basic';
    Constants.SHOE_DATA_FILE = 'shoes-chinese-simplified.json';*/


    _.extend(namespace, Backbone.Events, {
        $window         : $(window),
        $document       : $(document),
        $html           : $('html'),
        $body           : $('body'),
        $main           : $('main'),
        viewport        : $('#viewport').get(0),

        app             : null,
        debug           : null,
        stats           : null,
        noop            : function() {},

        preventDefault  : function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    });

    // shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, Constants.ANIM_INTERVAL);
              };
    })();


    // Load
    // -----------------------------------------------------------------------

    window.addEventListener('load', function() {
        namespace.app = new namespace.App({
            el: $('body')
        });

        // FPS Mode / Debug
        if (location.href.indexOf('perf') > 1 || Flags.isDebug) {
            // stats
            namespace.stats = new Stats;
            document.body.appendChild(namespace.stats.domElement);

            // debug
            namespace.debug = new namespace.View_Debug;
            namespace.debug.$el.appendTo(namespace.$body);
        }

        // render
        namespace.app.render();
    });


    // Console
    // -----------------------------------------------------------------------

    console.color = function() {
        var aa      = Array.prototype.slice.apply(arguments);
        var options = aa.pop() || {};
        aa[0]       = "%c " + aa[0] + " ";
        aa          = [aa.join(' '), "background: " + options.background + "; color: " + options.color + ";"];

        console.log.apply(console, aa);
    };


    // Math
    // ------------------------------------------------------------------------

    Math.map = function( value, low1, high1, low2, high2 ){
          return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
    };

    Math.clamp = function ( value, min, max ) {
        if ( max > min ) {
            value = Math.min( Math.max( value, min ), max );
        } else {
            value = Math.min( Math.max( value, max ), min );
        }
        return value;
    };


    if (!Math['sign'])
        Math.sign = function(val) {
            if (val > 0) return 1;
            if (val < 0) return -1;
            return 0;
        };


    // Super shorthand
    // ------------------------------------------------------------------------

    Object.defineProperty(window, 'a', {
        get: function(){
            return namespace.app;
        }
    });

    Object.defineProperty(window, 'g', {
        get: function(){
            return State.scene;
        }
    });

    Object.defineProperty(window, 'p', {
        get: function(){
            return namespace.app.pixi;
        }
    });

    Object.defineProperty(window, 's', {
        get: function(){
            return State;
        }
    });


})(window.pm || (window.pm = {}));


// Global Functions
function vpScale() {
    return pm.State.currentViewportHeight / 1920;
}

function scaled(number) {
    var result = vpScale() * number
    return result > -1 && result < 1 ? result : ~~result;
}

function roundTo(number, places) {
    return +(Math.round(number + "e+" + places)  + "e-" + places);
    // return number.toFixed(places);
}

function tracking(text, spaces) {
    return text.replace(/(.)(?=.)/g, '$1' + spaces);
}

function rt(n,p) { p || (p = 3); return roundTo(n, p); } //number, places



;(function(namespace) {
    'use strict';

    var Constants = namespace.Constants,
        Events    = namespace.Events;

    namespace.Base_ViewManager = function(view) {
        this._parent = view;
        this._byId   = {};
        this._views  = [];
    };

    namespace.Base_ViewManager.prototype = {
        index: 0,
        length: 0,

        _parent: false,
        _byId  : false,
        _views : false,

        add: function(view, name) {
            name || (name = 'model' in view ? view.model.cid : view.cid);

            this._views.push(view);
            this._byId[name] = view;
            view._viewName = name;

            // assign parent view
            if (!view.parent) {
                view.parent = this._parent;
            }

            this.length++;

            return this;
        },

        has: function(nameOrModel) {
            return this._getModelCidOrName(nameOrModel) in this._byId;
        },

        get: function(nameOrModel) {
            var name = this._getModelCidOrName(nameOrModel);

            // string
            if (this.has(name)) {
                return this._byId[name];
            }

            // number
            else if (typeof(nameOrModel) == 'number') {
                return this._views[nameOrModel];
            }
        },

        first: function() {
            return this.at(this.index = 0);
        },

        last: function() {
            return this.at(this.index = this.length - 1);
        },

        at: function(index) {
            return this._views[this.index = index];
        },

        remove: function(names) {
            names  || (names = []);
            names = _(names).isString() ? [names] : names;

            // iterate through list of view names
            _(names).each(function(name) {
                // make sure view exists
                if (this.has(name)) {
                    // call remove first
                    this._byId[name].remove();

                    // get index
                    var index = _.indexOf(this._views, this._byId[name]);

                    // delete hash
                    this._byId[name] = void 0;
                    delete this._byId[name];

                    // delete array
                    this._views.splice(index, 1);

                    // update length
                    this.length--;
                }
            }, this);

            return this;
        },

        reset: function(options) {
            options || (options = {});
            var except = options.except || [];
            except = _(except).isString() ? [except] : except;

            var names = [];

            this.execAll('reset');

            _.each(this._byId, function(view, name) {
                if (_.indexOf(except, name) === -1) {
                    names.push(name);
                }
            });

            // return this.remove(names);
            return true;
        },

        invoke: function() {
            return _.invoke.apply(_, [this._views].concat(_.toArray(arguments)));
        },

        indexOf: function() {
            return _.indexOf.apply(_, [this._views].concat(_.toArray(arguments)));
        },

        indexOfElement: function($el) {
            for (var i in this._views) {
                if (this.at(i).$el.get(0) == $el) {
                    return i;
                }
            }
        },

        each: function() {
            return _.each.apply(_, [this._views].concat(_.toArray(arguments)));
        },

        every: function() {
            return _.all.apply(_, [this._views].concat(_.toArray(arguments)));
        },

        execAll: function(methodName, except) {
            except || (except = []);
            var args = _.toArray(arguments);
                args.shift();

            _.each(this._views, function(view, index) {
                if (!_(except).contains(view._viewName)) {
                    view[methodName].apply(view, args);
                }
            }, this);
        },

        _getModelCidOrName: function(nameOrModel) {
            return _(nameOrModel).isObject() ? nameOrModel.cid : nameOrModel;
        }
    };

})(window.pm || (window.pm = {}));


;(function(namespace) {
    'use strict';

    var Constants = namespace.Constants,
        Events    = namespace.Events;

    namespace.Base_View = Backbone.View.extend({

        _animate_state: Events.ANIMATION_END,
        _animating    : null,

        views: null,
        isOpen: false,

        initialize: function(options) {
            options || (options = {});

            // bind
            _.bindAll(this, '_onAnimateIn', '_onAnimateOut');

            // views
            this.views = new namespace.Base_ViewManager(this);
            this.$v    = _.bind(function(x) {
                return this.views.get(x);
            }, this); // alias;

            // parent
            this.parent = options.parent || window;
        },

        attachEvents: function() {
            this.detachEvents();
            this.delegateEvents(this.events);

            if (this.views)
                this.views.execAll('attachEvents');
        },

        detachEvents: function() {
            this.undelegateEvents();

            if (this.views)
                this.views.execAll('detachEvents');
        },

        reattachEvents: function() {
            this.detachEvents();
            this.attachEvents();
        },

        animateIn: function(options) {
            options || (options = {});

            if (this.isOpen) return false;

            this.isOpen = true;

            options.duration = !isNaN(options.duration) ? options.duration : Constants.ANIMATION_DURATION;

            this._onAnimateStart();

            this.$el
                .stop()
                .delay(options.delay || 0)
                .fadeIn(options.duration, _.bind(this._onAnimateIn, this))
                .css('z-index', 100);

            return this;
        },

        animateOut: function(options) {
            options || (options = {});

            this.isOpen = false;

            options.duration = !isNaN(options.duration) ? options.duration : Constants.ANIMATION_DURATION;

            this._onAnimateStart();

            this.$el
                .stop()
                .delay(options.delay || 0)
                .fadeOut(options.duration, _.bind(this._onAnimateOut, this))
                .css('z-index', 1);

            return this;
        },

        animateToggle: function(options) {
            if (this._animate_state === Constants.ANIMATE_IN) {
                this.animateOut(options);
            }
            else if (this._animate_state === Constants.ANIMATE_OUT) {
                this.animateIn(options);
            }

            return this;
        },

        setOptions: function(options) {
            _.each(options, function(value, key) {
                this[key] = value;
            }, this);

            return this;
        },

        hide: function() {
            this.$el
                .css('display', '')
                .addClass('hide');

            return this;
        },

        show: function() {
            this.$el
                .css('display', '')
                .removeClass('hide');

            return this;
        },

        fadeIn: function() {
            this.$el
                .removeClass('hide')
                .hide()
                .fadeIn();

            return this;
        },

        fadeOut: function() {
            this.$el.fadeOut();

            return this;
        },

        lock: function() {
            this.locked = true;
        },

        unlock: function() {
            this.locked = false;
        },

        isLocked: function() {
            return this.locked === true;
        },

        setState: function(type) {
            this.$el.addClass('state-' + type);
        },

        unsetState: function(type) {
            this.$el.removeClass('state-' + type);
        },

        unsetAllStates: function(type) {
            this.$el[0].className = this.$el[0].className.replace(/\bstate\-.*?\b/g, '');
        },

        reset: function() {
            // remove custom style
            this.$el.attr('style', null);

            // reset subviews
            this.views.reset();

            // remove state classes
            this.unsetAllStates();

            return this;
        },


        // Internal
        // ---------------------------------------------------------------

        _setAnimateStart: function() {
            this._animate_state = Constants.ANIMATE_TRANSITION;
        },

        _setAnimateIn: function() {
            this._animate_state = Constants.ANIMATE_IN;
        },

        _setAnimateOut: function() {
            this._animate_state = Constants.ANIMATE_OUT;

            // add hidden class
            this.$el.addClass('hide');
        },


        // Event Handlers
        // ----------------------------------------------------------------

        _onAnimateStart: function() {
            this._setAnimateStart();

            this.trigger(Events.ANIMATING);
        },

        _onAnimateIn: function() {
            this._setAnimateIn();

            this.trigger(Events.ANIMATE_IN);

            // remove hidden class if exists
            this.$el.removeClass('hide');
            this.show();
        },

        _onAnimateOut: function() {
            this._setAnimateOut();

            this.trigger(Events.ANIMATE_OUT);
        }

    });

})(window.pm || (window.pm = {}));


;(function(namespace) {
    'use strict';

    var Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Flags      = namespace.Flags,
        Events     = namespace.Events,
        State      = namespace.State
    ;

    namespace.Abstract_PixiLayer = PIXI.Container.extend({

        assets: null,
        enabled: true,

        id: null,

        ia: 0,
        iy: 0,
        ix: 0,
        ir: 0,
        is: 0,
        da: 0,
        dy: 0,
        dx: 0,
        dr: 0,
        ds: 0,
        ea: 0,
        ey: 0,
        ex: 0,
        er: 0,

        // overrides
        ody: null,
        odx: null,

        iscale: 1,
        dscale: 1,

        alpha: 1,
        ialpha: 1,
        dalpha: 1,

        // colorMatrix: null,


        initialize: function(options) {
            options || (options = {});

            this.assets = {};
            this.id = Math.random();

            // set vars
            _.extend(this, options);


            // check ix/dx
            options.dx != null && options.ix == null && (this.ix = options.dx);
            options.dy != null && options.iy == null && (this.iy = options.dy);

            options.dx == null && options.ix != null && (this.dx = options.ix);
            options.dy == null && options.iy != null && (this.dy = options.iy);

            // update the name if we are an indexed type class
            // like fish, waves, balls, etc
            if (this.index) {
                this.name += this.index;
            }

            // interactive without hitarea
            if (this.interactive && !this.hitArea) {
                this.setInteractive();
            }

            // default positioning
            this.y = this.iy || options.y || 0;
            this.x = this.ix || options.x || 0;
        },


        // Assets
        // -----------------------------------------------------------------

        add: function(view, name, at, suppressLog) {
            var obj;

            this.assets[name] = view;
            view._name = name;

            if (typeof(at) == 'string') {
                // !suppressLog && console.color("[PixiLayer] Adding layer `" + name + "` to " + at, Colors.LAYERS);

                this.getChildByName(at).addChild(view);
            }
            else if (isNaN(at)) {
                // !suppressLog && console.color("[PixiLayer] Adding layer `" + name + "`", Colors.LAYERS);

                this.addChild(view);
            }
            else {
                // !suppressLog && console.color("[PixiLayer] Adding layer `" + name + "` at " + at, Colors.LAYERS);

                this.addChildAt(view, at);
            }

            return view;
        },

        get: function(name) {
            var obj, parts;

            // get descending children
            if (name.indexOf(' ') > -1) {
                parts = name.split(' ');
                name  = parts[0];
                obj   = this.assets[name];
                parts.shift();

                return obj.get(parts.join(' '));
            }

            return this.assets[name];
        },

        has: function(name) {
            return !!this.assets[name];
        },

        remove: function(name) {
            if (!this.get(name)) {
                console.warn("Layer may have already been removed.", name);

                return false;
            }

            // remove
            this.get(name).parent.removeChild(this.get(name));

            // remove from list
            delete this.assets[name];
        },

        removeAt: function(index) {
            return this.remove(this.getChildAt(index)._name);
        },

        pop: function() {
            this.removeAt(this.children.length - 1);
        },

        shift: function() {
            this.removeAt(0);
        },

        getLastChild: function() {
            return this.getChildAt(this.children.length - 1);
        },

        getChildByName: function(name) {
            for (var i = 0, l = this.children.length; i < l; i++) {
                if (this.getChildAt(i).name == name) {
                    return this.getChildAt(i);
                }
            }
        },

        setInteractive: function() {
            this.interactive = true;
            this.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);
        },

        disableInteractive: function() {
            this.mousedown = this.tap = this.click = this.mouseout = this.mouseover = null;
            this.interactive = false;
            this.hitArea = null;
        },

        setBrightness: function(amount) {
            var colorMatrix =  [
                1,0,0,amount,
                0,1,0,amount,
                0,0,1,amount,
                0,0,0,1
            ];

            var filter = new PIXI.filters.ColorMatrixFilter();
            filter.matrix = colorMatrix;
            this.filters = [filter];
        },

        setTint: function(amount) {
            this.tint = amount;
        },


        // Getters / Setters
        // -----------------------------------------------------------------

        gx: function(obj) {
            var obj = obj || this,
                x   = obj.x;

            while (obj = obj.parent) {
                x += obj.x;
            }

            return x;
        },

        gy: function(obj) {
            var obj = obj || this,
                y   = obj.y;

            while (obj = obj.parent) {
                y += obj.y;
            }

            return y;
        },

        setScale: function(scale) {
            this.scale.x = this.scale.y = scale;
        },

        setHard: function(variable, value) {
            this[variable] = this['d' + variable] = this['i' + variable] = value;
        },

        // setBrightness: function(percent) {
        //     this.colorMatrix.matrix = [
        //         1, 0, 0, percent,
        //         0, 1, 0, percent,
        //         0, 0, 1, percent,
        //         0, 0, 0, 1
        //     ];

        //     this.filters = [this.colorMatrix];
        // },

        isFlipped: function() {
            return this.scale.x == -1;
        },

        // Display
        // -----------------------------------------------------------------

        flip: function() {
            this.scale.x *= -1;
        },

        ratio: function(start, end, current) {
            start   || (start   = this.startTime);
            end     || (end     = this.endTime);
            current || (current = State.time);

            return Math.min(1, Math.max(0, (current - start) / (end - start)));
        },

        hide: function() {
            this.visible = false;

            return this;
        },

        show: function() {
            this.visible = true;

            return this;
        },

        render: function() {
            // default renderings (if pass-through)
            if (isNaN(this.y)) {
                this.y = this.iy;
                this.x = this.ix;
            }

            // get dx, dy from state
            // if (!State.isMaster && State.master[this.syncspace + this.name] && this.enableSync) {
            //     _.extend(this, State.master[this.syncspace + this.name]);
            // }

            // do all other renderings
            _.each(this.assets, function(asset) {
                asset.render && asset.render();
            });
        },

        update: function() {
            _.each(this.assets, function(asset) {
                asset.update && asset.update();
            });
        },

        each: function(callback, scope) {
            var i = 0;

            return _.each(this.assets, function(asset) {
                callback(asset, i++);
            }, scope);
        },

        reset     : function() { },
        start     : function() { },
        stop      : function() { },
        animateIn : function() { },
        animateOut: function() { },

        unload: function() {
            // stop this if not already
            this.stop && this.stop();

            _.each(this.assets, function(asset, key) {
                console.color("[Game] Unloading " + key, Colors.CRITICAL);

                // unload
                asset.unload && asset.unload();

                // remove asset
                try {
                    this.remove(key);
                }
                catch (e) {
                    console.warn("Possibly already was removed.", this.children.length);
                }
            }, this);
        },


        // Event Handlers
        // -------------------------------------------------------------------

        attachEvents: function() { },
        detachEvents: function() { },

        onClick: function(e) {
            e.stopPropagation();

            this.trigger(Events.CLICK_LAYER, e, this);
            this.trigger(Events.CLICK, e, this);
        },

        onMouseOut: function(e) { },
        onMouseOver: function(e) { },

        tap      : function(e) { this.onClick(e); },
        click    : function(e) { this.onClick(e); },
        mouseout : function(e) { this.onMouseOut(e); },
        mouseover: function(e) { this.onMouseOver(e); },


        // Debug
        // -------------------------------------------------------------------

        log: function(msg) {
            console.log('[' + this.name + '] ', msg);
        },

        debug: function(useMarkers) {
            var log     = [],
                toDebug = _.extend({ _top: this }, this.assets);

            console.color("[PixiLayer] -- " + this.name + " Debug -- ", Colors.DEBUG);

            // loop
            _.each(toDebug, function(asset, key) {
                log.push({
                    name   : key,
                    x      : asset.x,
                    y      : asset.y,
                    width  : asset.width,
                    height : asset.height,
                    gx     : asset.gx ? asset.gx() : this.gx(asset),
                    gy     : asset.gy ? asset.gy() : this.gy(asset),
                    alpha  : asset.alpha,
                    visible: asset.visible,
                    cached : asset.cacheAsBitmap
                });

                // show markers
                useMarkers && asset.debugMarker && asset.debugMarker();
            }, this);

            console.table(log);
        },

        debugMarker: function(center) {
            if (!Flags.isDebug) {
                return false;
            }

            var color    = 0x00FF00;
            var dist     = 10;
            var graphics = new PIXI.Graphics;
                graphics.lineStyle(2, color, 1);
                graphics.moveTo(-dist, 0);
                graphics.lineTo(dist, 0);
                graphics.moveTo(0, -dist);
                graphics.lineTo(0, dist);
                graphics.drawCircle(0, 0, dist / 2);

                // // right
                // graphics.lineStyle(2, 0x00FFFF, 1);
                // graphics.moveTo(this.width, 0);
                // graphics.lineTo(this.width, this.height);

                // // left
                // graphics.lineStyle(2, 0xFF0000, 1);
                // graphics.moveTo(0, 0);
                // graphics.lineTo(0, this.height);

                // // top
                // graphics.lineStyle(2, 0xFF0000, 1);
                // graphics.moveTo(0, 2);
                // graphics.lineTo(this.width, 2);

                // // bottom
                // graphics.lineStyle(2, 0x00FF00, 1);
                // graphics.moveTo(0, this.height - 2);
                // graphics.lineTo(this.width, this.height - 2);

            if (center) {
                graphics.x = (this['getWidth'] ? this.getWidth() : this.width) / 2;
            }

            this.addChild(graphics);
        }

    });

})(window.pm || (window.pm = {}));



;(function(namespace) {
    'use strict';

    var Constants = namespace.Constants,
        Flags     = namespace.Flags;

    namespace.Base_PixiView = namespace.Base_View.extend({

        children: {},

        add: function(view, name, addTo) {
            addTo || (addTo = this.get('wrapper') || this.el);

            this.children[name] = view;

            addTo.addChild(view);
        },

        get: function(name) {
            var view;

            view = this.children[name];

            return view;
        },

        remove: function(name) {
            var view;

            view = this.children[name];

            view.parent.removeChild(view);

            delete this.children[name];
        }

    });

})(window.pm || (window.pm = {}));


;(function(namespace) {
    'use strict';

    var Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        GameAssets = namespace.GameAssets,
        Flags      = namespace.Flags,
        State      = namespace.State
    ;

    namespace.Abstract_Scene = namespace.Abstract_PixiLayer.extend({

        // layers
        layers: null,

        // is our game running
        isRunning: false,


        initialize: function(options) {
            options || (options = {});

            // spuer
            namespace.Abstract_PixiLayer.prototype.initialize.call(this);

            // variables
            this.layers = {};
            this.scenes = {};

            // debug
            if (Flags.isDebug && this.debug) {
                this.debug();
            }

            // trigger
            namespace.trigger(Events.SCENE_START);
        },

        attach: function() {
            console.warn("[AbstractScene] No attach available.");
        },

        detach: function() {
            console.warn("[AbstractScene] No detach available.");
        },


        // Actions
        // -------------------------------------------------------------------

        zoom: function(scale, anchor_x, anchor_y) {
            this.pivot.x = State.currentViewportWidth  * anchor_x;
            this.pivot.y = State.currentViewportHeight * anchor_y;
            this.x       = State.currentViewportWidth  * anchor_x;
            this.y       = State.currentViewportHeight * anchor_y;

            this.setScale(scale);
        },

        start: function() {
            // set running
            this.isRunning = true;
        },

        stop: function() {
            // set running
            this.isRunning = false;
        },

        unload: function() {
            // spuer
            namespace.Abstract_PixiLayer.prototype.unload.call(this);

            // remove
            while (this.children.length > 0) {
                this.removeChild(this.getChildAt(0));
            }

            this.removeStageReference();

            // remove this
            if (this.parent) {
                this.parent.removeChild(this);
            }
            else {
                console.color("[AbstractScene] No parent to unload child from.", Colors.CRITICAL);
            }
        }

    });

}) (window.pm || (window.pm = {}));


;(function(namespace) {
    'use strict';

    var Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        Flags      = namespace.Flags,
        State      = namespace.State;

    namespace.View_Pixi = namespace.Base_PixiView.extend({

        initialize: function(options) {
            options || (options = {});

            // bindings
            _.bindAll(this, 'onRequestAnimationFrame', 'onRequestUpdate', 'onResize', 'onTick');

            // super
            namespace.Base_PixiView.prototype.initialize.call(this, options);

            // enable single buffer batching
            PIXI.WebGLRenderer.batchMode = PIXI.WebGLRenderer.BATCH_SIMPLE;

            // max # of sprites in batch.. default is 500.. play around with this
            PIXI.WebGLRenderer.batchSize = 250;

            var renderer = Constants.RENDERER == 'auto' ? 'autoDetectRenderer' : 'CanvasRenderer';

            // pixi
            this.stage    = new PIXI.Container(0xFFFFFF);
            this.renderer = new PIXI[renderer](
                State.currentViewportWidth,
                State.currentViewportHeight,
                {
                    autoResize: true,
                    backgroundColor: 0xFFFFFF,

                    view       : this.$el.find('canvas').get(0),
                    forceFXAA  : Constants.FXAA,      // faster, but maybe not as pretty
                    antialias  : Constants.ANTIALIAS,      // -4 fps
                    transparent: false,
                    resolution : Constants.RETINA ? 2 : 1           // retina = 2
                },
                !"noWebGL"
            );

            // assets
            this.$el.find('canvas').attr('style', null);

            // don't render anything outside these bounds
            this.stage.cullingRect = new PIXI.Rectangle(0, 0, State.currentViewportWidth, State.currentViewportHeight);

            // creates a global wrapper on the stage
            // used for scaling and global actions
            this.add(new PIXI.Container, 'wrapper', this.stage);

            // globally set scale
            this.get('wrapper').scale = {
                x: Constants.DYNAMIC_SCALING ? vpScale() : Constants.VIEWPORT_SCALE,
                y: Constants.DYNAMIC_SCALING ? vpScale() : Constants.VIEWPORT_SCALE
            }

            // resize
            namespace.on(Events.RESIZE, this.onResize);
        },


        // Controls
        // ----------------------------------------------------------

        start: function() {
            // unpause
            if (State.isPaused) {
                this.unpause();
                return false;
            }

            // cancel start
            if (State.isRunning) {
                console.warn("[App] Already running. Canceling start.");
                return false;
            }

            // log
            console.color('[Pixi] Starting Animation', Colors.ACTION);

            // start rendering
            State.isPaused = false;
            State.isRunning = true;
            State.isAnimating = true;

            // Used for active updating
            State.RAF = this.onRequestAnimationFrame();

            // Used for controlling display framerate
            namespace.Ticker.maxDelta = 40;
            namespace.Ticker.setFPS(Constants.TARGET_FPS);
            namespace.Ticker.on("tick", this.onTick);
            namespace.Ticker.init();
        },

        pause: function() {
            State.isAnimating = false;
            State.isPaused    = true;

            if (namespace.Ticker) {
                namespace.Ticker.setPaused(State.isPaused);
            }

            // log
            console.color('[App] Pausing Animation', Colors.ACTION);
        },

        unpause: function() {
            if (State.isRunning)
                State.isAnimating = true;

            State.isPaused = false;

            if (namespace.Ticker) {
                namespace.Ticker.setPaused(State.isPaused);
            }

            // log
            console.color('[App] Unpausing Animation', Colors.ACTION);
        },

        stop: function() {
            if (!State.isRunning) {
                console.warn("[App] Already stopped. Canceling stop.");
                return false;
            }

            cancelAnimationFrame(State.RAF);
            clearInterval(State.Timer);

            State.RAF         = undefined;
            State.Timer       = undefined;
            State.isAnimating = false;
            State.isRunning   = false;

            // using ticker?
            if (namespace.Ticker) {
                namespace.Ticker.off("tick", this.onTick);
                namespace.Ticker.reset();
            }

            // log
            console.color('[App] Stopping Animation', Colors.ACTION);
        },


        // Animation
        // ----------------------------------------------------------

        render: function() {
            // render
            State.scene.render(this, this.stage, this.renderer);

            // render stage
            if (!Flags.noRender) {
                this.renderer.render(this.stage);
            }

            // broadcast
            namespace.trigger(Events.SCENE_RENDER);
        },

        update: function() {
            // master updates content
            // this is part of the update (data) and render (draw)
            State.scene.update(this, this.stage, this.renderer);

            // broadcast
            namespace.trigger(Events.SCENE_UPDATE);
        },

        animateIn: function(options) {
            this.$el.stop().show();
            this.start();
        },

        animateOut: function(options) {
            // super
            this.$el.stop().hide();
            this.stop();
        },

        unload: function() {
            while (this.get('wrapper').children.length) {
                this.get('wrapper').removeChildAt(0);
            }
        },


        // Event Handlers
        // ----------------------------------------------------------

        // this can be swapped out for a TCP style
        // remote promise
        onRequestAnimationFrame: function() {
            // Flags.isDebug && namespace.stats.begin();

            if (State.isPaused) {
                return false
            }

            this.update();
            // this.render();

            // Flags.isDebug && namespace.stats.end();

            // increase tick locally
            // we also have a remote tick
            State.tick++;

            // request anim
            State.RAF = requestAnimFrame(this.onRequestAnimationFrame);
        },

        onTick: function() {
            Flags.isDebug && namespace.stats.begin();

            if (State.isPaused) {
                return false
            }


            // render every tick
            this.render();

            Flags.isDebug && namespace.stats.end();
        },

        //
        onRequestUpdate: function() {
            this.update();
        },

        onResize: function() {
            this.stage.cullingRect.width = State.currentViewportWidth;
            this.stage.cullingRect.height = State.currentViewportHeight;

            // this.get('wrapper').scale = {
            //     x: Constants.DYNAMIC_SCALING ? vpScale() : Constants.VIEWPORT_SCALE,
            //     y: Constants.DYNAMIC_SCALING ? vpScale() : Constants.VIEWPORT_SCALE
            // }

            // this.renderer.resize(State.currentViewportWidth, State.currentViewportHeight);
        }

    });

})(window.pm || (window.pm = {}));


;(function(namespace) {
    'use strict';

    var Constants = namespace.Constants,
        Events    = namespace.Events,
        Flags     = namespace.Flags,
        State     = namespace.State
    ;

    namespace.View_Debug = namespace.Base_View.extend({

        interval: null,
        id: "debug",

        initialize: function(options) {
            options || (options = {});

            // bindings
            _.bindAll(this, 'onTick');

            // super
            namespace.Base_View.prototype.initialize.call(this, options);

            // el
            this.$el.attr('id', this.id);

            // views
            if (Flags.useDebugPanel)
                this.interval = setInterval(this.onTick, Constants.ANIM_INTERVAL);
        },

        render: function() {
            // reset
            this.$el.html('');

            // values
            this.add('tick',   State.tick);
            this.add('time',   State.time);

            this.divider();

            this.add('v-width', State.currentViewportWidth);
            this.add('v-height', State.currentViewportHeight);

            this.divider();

            this.add('app-chil', namespace.app.pixi.get('wrapper').children.length);

            this.divider();

            this.add('caro-x',   State.carouselX);
            this.add('caro-dx',  State.carouselDX);
            this.add('caro-rx',  State.carouselRatioX);
            this.add('caro-rdx', State.carouselRatioDX);
            this.add('caro-lli', State.lastLockedIndex);

            this.divider();

            this.add('m-down', State.mouse.down);
            this.add('m-x', State.mouse.x);
            this.add('m-y', State.mouse.y);
            this.add('m-ratioX', State.mouse.ratioX);
            this.add('m-ratioY', State.mouse.ratioY);
            this.add('m-inertX', State.mouse.inertiaX);
            this.add('m-inertY', State.mouse.inertiaY);

            this.divider();

            this.add('animating', State.isAnimating);
            this.add('paused', State.isPaused);
            this.add('running', State.isRunning);

            if (State.debug && State.debug.length) {
                this.divider();

                this.custom();
            }

            return this;
        },

        add: function(label, value) {
            this.$el.append([
                '<div>',
                    '<span class="label">' + label + '</span>',
                    '<span class="value">' + value + '</span>',
                '</div>'
            ].join(''));
        },

        custom: function() {
            for (var i in State.debug) {
                this.add( State.debug[i][0], State.debug[i][1]() );
            }
        },

        divider: function() {
            this.$el.append('<hr>');
        },


        // Event Handlers
        // -----------------------------------------------------------------

        onTick: function() {
            this.render();
        }

    });

})(window.pm || (window.pm = {}));


;(function(namespace) {
    'use strict';

    var Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        Flags      = namespace.Flags,
        State      = namespace.State
    ;

    namespace.Assets = {

        //DATA_URL : Constants.DATA_HOST + '/shoes.json',
        DATA_URL : Constants.DATA_HOST + '/' + Constants.SHOE_DATA_FILE,
        FONT_DIR : Constants.FONT_HOST + '/jordan',
        IMAGE_DIR: Constants.IMAGE_HOST,

        // <Object> Holds data from shoes
        data: null,

        resources: null,

        count: function() {
            return this.data.shoes.length;
        },

        load: function(options) {
            var self = this;

            // bindings
            _.bindAll(this, 'loadOther', 'loadNumbers', 'loadShoes');
            _.bindAll(this, 'onLoadProgress', 'onLoadComplete');

            // create
            this.resources = { };

            // load
            this.loadData()
                .success(this.loadOther)
                .success(this.loadNumbers)
                .success(this.loadShoes)
                .success(function() {
                    PIXI.loader.load();
                });

            // events
            PIXI.loader.on(Events.PROGRESS, this.onLoadProgress);
            PIXI.loader.on(Events.COMPLETE, this.onLoadComplete);

            return this;
        },

        each: function(func, scope) {
            return _(this.data.shoes).each(func, scope);
        },


        // Getters
        // -------------------------------------------------------------------

        getShoeResource: function(index) {
            return this.data.shoes[index].shoeResource;
        },

        getShoeThumbResource: function(index) {
            return this.data.shoes[index].thumbResource;
        },

        getYearResource: function(index) {
            return this.data.shoes[index].yearResource;
        },

        getShadowResource: function(index) {
            if (Constants.SHADOWS){
                return this.data.shoes[index].shadowResource;
            }

        },

        getMiscResource: function(name) {
            return this.resources[name];
        },


        // Setup
        // ----------------------------------------------------------

        loadData: function(callback) {
            console.color( 'Loading data...', Colors.ASSETS );

            var self = this;

            return $.get(this.DATA_URL)
                .success(function(data, status) {
                    self.data = typeof(data) == 'string' ? JSON.parse(data) : data;
                });
        },

        loadOther: function() {
            _.each(this.data.misc, function(model, index) {

                console.color( 'Adding other - ' + model.name, Colors.ASSETS_LIGHT );
                PIXI.loader.add(model.name, this.IMAGE_DIR + '/' + model.img);

            }, this);

            return PIXI.loader;
        },

        loadNumbers: function() {
            _.each(this.data.shoes, function(model, index) {

                console.color( 'Adding number ' + index, Colors.ASSETS_LIGHT );
                PIXI.loader.add('year' + index, this.IMAGE_DIR + '/years/medium/year-' + (index + 1) +(Constants.USE_JPG ? '.jpg' : '.png'));
                if (Constants.SHADOWS){
                    PIXI.loader.add('shadow' + index, this.IMAGE_DIR + '/shadows/medium/shadow-' + (index + 1) + (Constants.USE_JPG ? '.jpg' : '.png'));
                }

            }, this);

            return PIXI.loader;
        },

        loadShoes: function() {
            _.each(this.data.shoes, function(model, index) {

                console.color( 'Adding shoe ' + index, Colors.ASSETS_LIGHT );
                PIXI.loader.add('shoe' + index, this.IMAGE_DIR + '/shoes' + Constants.IMAGE_SUBPATH + '/' + model.img + '.' +  Constants.SHOES_FORMAT);
                PIXI.loader.add('shoe-thumb' + index, this.IMAGE_DIR + '/shoes' + Constants.IMAGE_THUMBPATH + '/' + model.img + '.' +  Constants.SHOES_FORMAT);

            }, this);

            return PIXI.loader;
        },


        // Event Handlers
        // ------------------------------------------------------------------

        onLoadProgress: function(loader, resources) {
            namespace.trigger(Events.PROGRESS, loader.progress);
        },

        onLoadComplete: function(loader, resources) {
            var key, index;

            for (key in resources) {

                // parse out shoe images
                if (key.indexOf('shoe-thumb') > -1) {
                    index = parseFloat(key.replace('shoe-thumb', ''));

                    this.data.shoes[index].thumbResource = resources[key];
                }
                else if (key.indexOf('shoe') > -1) {
                    index = parseFloat(key.replace('shoe', ''));

                    this.data.shoes[index].shoeResource = resources[key];
                }
                else if (key.indexOf('shadow') > -1 && Constants.SHADOWS) {
                    index = parseFloat(key.replace('shadow', ''));

                    this.data.shoes[index].shadowResource = resources[key];
                }
                else if (key.indexOf('year') > -1) {
                    index = parseFloat(key.replace('year', ''));

                    this.data.shoes[index].yearResource = resources[key];
                }
                else {
                    console.log( "Loaded " + key);
                    this.resources[key] = resources[key];
                }

            }

            // tell everyone we're loaded
            namespace.trigger(Events.LOADED, this.data);
        }

    };

})(window.pm || (window.pm = {}));


/**
 * PixiLayer_Arrow
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Arrow = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'arrow',

        // <Integer> Color
        color: 0x999999,

        // <Integer> Width of line
        lineWidth: 8,

        // <Integer> How far out we want the line to go
        lineOut: 30,

        // <Integer> How far up we want the line to go
        lineUp: 30,

        // <Boolean> Set events to be on
        interactive: true,

        // <PIXI_Rectangle> Hit area
        hitArea: new PIXI.Rectangle(-100, -300, 200, 600),


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // assets
            this.addArrow();
        },

        addArrow: function() {
            var lo = scaled(this.lineOut),
                lu = scaled(this.lineUp),
                lw = scaled(this.lineWidth);

            this.add(new PIXI.Graphics, 'arrow');
            this.drawArrow(this.color);
        },

        drawArrow: function(color) {
            var lo = scaled(this.lineOut),
                lu = scaled(this.lineUp),
                lw = scaled(this.lineWidth);

            this.get('arrow')
                .clear()
                .lineStyle(lw, color, 1)
                .moveTo(lo, -lu)
                .lineTo(0, 0)
                .lineTo(lo, lu);
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            this.dalpha = 1;
        },

        animateOut: function() {
            this.dalpha = 0;
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // arrow position
            this.y     = ~~( this.y - (this.y - this.dy) * 0.1);
            this.x     = ~~( this.x - (this.x - this.dx) * 0.1);
            this.alpha = this.alpha - (this.alpha - this.dalpha) * 0.1; //MH - disable arrow opacity change on carousel drag
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onClick: function(e, instance) {
            var arrow = this.get('arrow'),
                obj   = { rgb: 255 },
                self  = this;

            // super
            namespace.Abstract_PixiLayer.prototype.onClick.call(this, e);

            // move
            this.drawArrow(0xFFFFFF);

            //
            $(obj).stop().animate({
                rgb: 127
            }, {
                duration: 2000 * Constants.DO_ANIMATE, //MH - if DO_ANIMATE is set to 0, arrow rgb never returns to gray
                easing: (Constants.SINGLE_EASE ? Constants.EASE : "easeOutQuart"),
                step: function() {
                    var rgb = ~~ obj.rgb;
                    self.drawArrow(rgb * 65536 + rgb * 256 + rgb);
                }
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_AttractLoop
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_AttractLoop = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'attract loop',

        // <Boolean> Set events to be on
        interactive: true,

        // <PIXI_Rect>
        hitArea: new PIXI.Rectangle(0, 0, State.currentViewportWidth, State.currentViewportHeight),

        // <Array>
        ANCHORS_TR: [0.15, 1.00],
        ANCHORS_BL: [0.65, 0.25],

        // <Float> Scale of shoes we need (to container) for proper fit
        SHOE_SCALE: 0.75,

        // <Integer> Higher is slower
        SHOE_SPEED: 300,

        // <Boolean>
        IS_ANIMATING: true,


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add elements
            this.add(new namespace.PixiLayer_TouchToBegin, 'touch-to-begin');
            this.add(new namespace.Abstract_PixiLayer, 'shoe-wrapper-1');
            this.add(new namespace.Abstract_PixiLayer, 'shoe-wrapper-2');

            // shoes
            this.addShoes();
        },

        addShoes: function() {
            this.addShoesToContainer('shoe-wrapper-1', this.ANCHORS_TR);
            this.addShoesToContainer('shoe-wrapper-2', this.ANCHORS_BL);
        },

        addShoesToContainer: function(container_name, anchors) {
            var container = this.get(container_name),
                maxShoes  = 3,
                shoe,
                shoeIndex;

            for (var i = container.children.length, l = maxShoes; i < l; i++) {
                shoeIndex = ~~ (Math.random() * Assets.data.shoes.length);

                // create shoe
                shoe = new namespace.PixiLayer_Shoe({
                    shoeIndex: shoeIndex,
                    resource : Assets.getShoeResource(shoeIndex)
                });

                // size/pos
                shoe.scaleToContainer( this.SHOE_SCALE );
                shoe.sprite.anchor.set( anchors[0], anchors[1] );

                // add to wrapper
                container.add(shoe, 'shoe-' + i, 0);
            }
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {

        },

        animateOut: function() {
            // stop moving shoes
            this.IS_ANIMATING = false;

            // fade outtouch
            this.get('touch-to-begin').animateOut();

            // large grid shoes
            State.gridShoes = this.exportShoes();

            // trigger
            setTimeout(function(s) {
                s.trigger(Events.ANIMATE_OUT);
            }, 250, this);
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            var wrapper;

            // super
            // namespace.Abstract_PixiLayer.prototype.render.call(this);

            this.y = ~~(this.y - (this.y - this.dy) * 0.1);
            this.x = ~~(this.x - (this.x - this.dx) * 0.1);

            //
            this.get('touch-to-begin').render();

            if (this.IS_ANIMATING) {

                //
                this.get('shoe-wrapper-1').x = State.currentViewportWidth  / 2;
                this.get('shoe-wrapper-1').y = State.currentViewportHeight / 2;

                this.get('shoe-wrapper-2').x = State.currentViewportWidth  / 2;
                this.get('shoe-wrapper-2').y = State.currentViewportHeight / 2;

                // shoes
                wrapper = this.get('shoe-wrapper-1');
                this.renderShoeWrapper1(wrapper.get('shoe-0'), 0);
                this.renderShoeWrapper1(wrapper.get('shoe-1'), 1);
                this.renderShoeWrapper1(wrapper.get('shoe-2'), 2);
                // wrapper.each(_.bind(this.renderShoeWrapper1, this));

                wrapper = this.get('shoe-wrapper-2');
                this.renderShoeWrapper2(wrapper.get('shoe-0'), 0);
                this.renderShoeWrapper2(wrapper.get('shoe-1'), 1);
                this.renderShoeWrapper2(wrapper.get('shoe-2'), 2);
                // wrapper.each(_.bind(this.renderShoeWrapper2, this));
            }
        },

        renderShoeWrapper1: function(object, index) {
            var xOffset = 400, // how far to fluctuate on horizontal axis
                yOffset = 120, // how far to fluctuate on vertical axis
                rOffset = 1.4,  // where to start scaling around Sine
                sOffset = 0.75,
                dOffset = this.SHOE_SPEED, // higher number determines speed
                d       = State.tick / dOffset,
                xyrOffset = Math.PI * 2 / 3 * (index + 1);

            // swap indexes
            // @todo, could probably optimize a bit by limiting how many times this happens
            if (~~ ((d + xyrOffset) % 6) == 2) {
                object.parent.setChildIndex(object, 0);
            }

            object.render();

            object.x      = -50 + xOffset  + Math.sin(d + xyrOffset) * xOffset;
            object.y      = -yOffset + Math.cos(d + xyrOffset) * yOffset;
            object.dscale = Math.sin(d + rOffset + xyrOffset) / 3 + sOffset;
        },

        renderShoeWrapper2: function(object, index) {
            var xOffset = 400, // how far to fluctuate on horizontal axis
                yOffset = 100,   // how far to fluctuate on vertical axis
                rOffset = 70,   // where to start scaling around Sine
                dOffset = this.SHOE_SPEED,  // higher number determines speed
                sOffset = 0.75,
                d       = State.tick / dOffset,
                xyrOffset = Math.PI * 2 / 3 * (index + 1);

            // swap indexes
            // @todo, could probably optimize a bit by limiting how many times this happens
            if (~~ ((d + xyrOffset) % 6) == 4) {
                object.parent.setChildIndex(object, 0);
            }

            object.render();

            object.x      = xOffset * Math.cos(d + xyrOffset) - xOffset + 100;
            object.y      = yOffset * Math.sin(d + xyrOffset) + yOffset;
            object.dscale = Math.sin(d + rOffset + xyrOffset) / 3 + sOffset;
        },

        exportShoes: function() {
            var shoe, shoes = [];

            // shoes.push( this.get('shoe-wrapper-1 shoe-0').export() );
            // shoes.push( this.get('shoe-wrapper-1 shoe-1').export() );
            // shoes.push( this.get('shoe-wrapper-1 shoe-2').export() );
            // shoes.push( this.get('shoe-wrapper-2 shoe-0').export() );
            // shoes.push( this.get('shoe-wrapper-2 shoe-1').export() );
            // shoes.push( this.get('shoe-wrapper-2 shoe-2').export() );

            return shoes;
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onClick: function(e) {
            this.animateOut();
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_AttractLoop
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_AttractLoop = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'attract loop',

        // <Boolean> Set events to be on
        interactive: true,

        // <PIXI_Rect>
        hitArea: new PIXI.Rectangle(0, 0, State.currentViewportWidth, State.currentViewportHeight),

        // <Float> Scale of shoes we need (to container) for proper fit
        SHOE_SCALE: 0.75,

        // <Integer>
        POSITION: 0,

        POSITIONS: [

            // One -------------------------------

            // TR
            {
                x      : 0.2,
                y      : -0.15,
                anchorX: 0.15,
                anchorY: 1.00,
                scale  : 1.3
            },

            // BL
            {
                x      : 0.15,
                y      : 0.15,
                anchorX: 0.15,
                anchorY: 0.60,
                scale  : 0.35
            },

            // BR
            {
                x      : 0.45,
                y      : 0.0,
                anchorX: 0.65,
                anchorY: 0.0,
                scale  : 1.21
            },


            // Two -------------------------------

            // TL
            {
                x      : -0.2,
                y      : -0.25,
                anchorX: 0.85,
                anchorY: 1.00,
                scale  : 1.3
            },

            // TR
            {
                x      : -0.75,
                y      : -0.15,
                // tx     : scaled(100),
                anchorX: -0.50,
                anchorY: 1.00,
                scale  : 1.2
            },

            // BL
            {
                x      : 0.21,
                y      : 0.15,
                anchorX: 0.75,
                anchorY: 0.35,
                scale  : 1.5
            },

            // Three -------------------------------


            // BL
            {
                x      : 0.15,
                y      : 0.15,
                anchorX: 0.15,
                anchorY: 0.60,
                scale  : 0.35
            },

            // TL
            {
                x      : -0.2,
                y      : -0.35,
                anchorX: 0.85,
                anchorY: 1.00,
                scale  : 1.3
            },

            // TR
            {
                x      : -0.75,
                y      : -0.15,
                // tx     : scaled(100),
                anchorX: -0.50,
                anchorY: 1.00,
                scale  : 1.2
            },


            // Four -------------------------------


            // BL
            {
                x      : 0.21,
                y      : 0.15,
                anchorX: 0.75,
                anchorY: 0.35,
                scale  : 1.5
            },


            // TL
            {
                x      : -0.2,
                y      : -0.35,
                anchorX: 1.00,
                anchorY: 1.00,
                scale  : 0.8
            }

        ],

        shoesOn: null,


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add elements
            this.add(new namespace.PixiLayer_TouchToBegin, 'touch-to-begin');

            // shoes hash
            this.shoesOn = {

            };

            // shoes
            this.addShoes();
        },

        addShoes: function() {
            this.add(new namespace.Abstract_PixiLayer, 'wrapper');
        },

        addShoe: function() {
            var container = this.get('wrapper'),
                shoe,
                shoeIndex;

            // chose random shoe
            shoeIndex = this.getRandomShoe();

            // create shoe
            shoe = new namespace.PixiLayer_Shoe({
                resource : Assets.getShoeResource(shoeIndex)
            });
            shoe.index = shoeIndex;

            // make invisible
            shoe.setHard('alpha', 0);

            // add to wrapper
            container.add(shoe, 'shoe' + Math.random());

            //
            return shoe;
        },

        animateShoe: function(shoe, position, callback) {
            position || (position = this.POSITIONS[0]);

            var scale       = this.SHOE_SCALE * position.scale,
                minDuration = 3000;

            // size/pos
            shoe.scaleToContainer( scale );
            shoe.setScale(scale);
            shoe.ds = scale;

            // set anchor
            shoe.sprite.anchor.set(position.anchorX, position.anchorY);

            // set xy
            shoe.x = shoe.dx = State.currentViewportWidth / 2 + (State.currentViewportWidth / 2 * position.x);
            shoe.y = shoe.dy = State.currentViewportHeight / 2 + (State.currentViewportHeight / 2 * position.y)

            $(shoe).animate({
                alpha: 1
            }, {
                queue: false,
                duration: 1000 * 2 * Constants.DO_ANIMATE
            });

            $(shoe).animate({
                ds: shoe.ds + (shoe.ds * 0.07),
                dx: shoe.dx + (position.tx || 0)
            }, {
                queue   : false,
                easing  : 'easeInOutQuad',
                duration: minDuration + 1000 * 5 * Constants.DO_ANIMATE
            });

            setTimeout(function() {
                $(shoe)
                    .animate({
                        alpha: 0
                    }, {
                        queue: false,
                        duration: 1000 * Constants.DO_ANIMATE,
                        complete: callback
                    });
            }, minDuration + 1000 * 4);
        },

        animateLoop: function() {
            var self = this,
                shoe = this.addShoe();

            // animate it
            this.animateShoe(shoe, this.POSITIONS[this.POSITION++], function() {

                // remove shoe index
                self.shoesOn[shoe.index] = false;

                // reset position
                if (self.POSITION >= self.POSITIONS.length) {
                    self.POSITION = 0;
                }

                // remove shoe
                self.get('wrapper').removeAt(0);

                // animate new shoe
                self.animateLoop();

            });
        },

        getRandomShoe: function() {
            var index = ~~ (Math.random() * Assets.data.shoes.length);

            if (this.shoesOn[index] == 1) {
                console.warn("Duplicate shoe found!");
                return this.getRandomShoe();
            }
            else {
                this.shoesOn[index] = 1;
                return index;
            }
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            var self = this;

            setTimeout(function() { self.animateLoop(); },   0 * 1000 );
            setTimeout(function() { self.animateLoop(); },   2 * 1000 );
            setTimeout(function() { self.animateLoop(); },   4 * 1000 );
        },

        animateOut: function() {
            // fade outtouch
            this.get('touch-to-begin').dalpha = 0;

            setTimeout(function(s) {
                s.visible = false;
                s.trigger(Events.ANIMATE_OUT);
            }, 250, this);
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            this.y = this.dy;
            this.x = this.dx;

            // run through shoes
            this.get('wrapper').each(function(shoe, index) {
                shoe.setScale(shoe.ds)
            }, this);
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onClick: function(e) {
            this.animateOut();
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_AttractLoop
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_AttractLoop = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'attract loop',

        // <Boolean> Set events to be on
        interactive: true,

        // <PIXI_Rect>
        hitArea: new PIXI.Rectangle(0, 0, State.currentViewportWidth, State.currentViewportHeight),

        // <Object> List of shoes currently showing
        shoesOn: null,

        // <Integer> How many shoe have been added
        shoesAdded: 0,

        //
        SHOE_SCALE: 0.85,

        //
        MAX_SHOES_PER_ROW: 4,

        SCALE_SMALL : 0.55,
        SCALE_MEDIUM: 0.85,
        SCALE_LARGE : 1.25,


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add elements
            this.add(new namespace.PixiLayer_TouchToBegin, 'touch-to-begin');

            // shoes array
            this.shoesOn = [];

            // shoes
            this.addShoes();
        },

        addShoes: function() {
            var halfHeight = State.currentViewportHeight / 2;

            this.add(new namespace.Abstract_PixiLayer, 'top-1');
            this.add(new namespace.Abstract_PixiLayer, 'top-2');
            this.add(new namespace.Abstract_PixiLayer, 'top-3');

            this.add(new namespace.Abstract_PixiLayer, 'bottom-1');
            this.add(new namespace.Abstract_PixiLayer, 'bottom-2');
            this.add(new namespace.Abstract_PixiLayer, 'bottom-3');

            // top is higher than bottom due to the 'TOUCH TO BEGIN' being higher
            // than center
            this.get('top-1').y = halfHeight + (halfHeight * -0.60);
            this.get('top-2').y = halfHeight + (halfHeight * -0.40);
            this.get('top-3').y = halfHeight + (halfHeight * -0.15);

            this.get('bottom-1').y = halfHeight + (halfHeight * 0.25);
            this.get('bottom-2').y = halfHeight + (halfHeight * 0.50);
            this.get('bottom-3').y = halfHeight + (halfHeight * 0.85);

            this.get('top-1').setScale( scaled(this.SCALE_SMALL) );
            this.get('top-2').setScale( scaled(this.SCALE_MEDIUM) );
            this.get('top-3').setScale( scaled(this.SCALE_LARGE) );

            this.get('bottom-1').setScale( scaled(this.SCALE_SMALL) );
            this.get('bottom-2').setScale( scaled(this.SCALE_MEDIUM) );
            this.get('bottom-3').setScale( scaled(this.SCALE_LARGE) );

            this.get('top-1').x = State.currentViewportWidth / 2;
            this.get('top-3').x = State.currentViewportWidth / 2;
            this.get('bottom-2').x = State.currentViewportWidth / 2;
        },

        addShoe: function(container) {
            var container,
                shoe,
                shoeIndex;

            // chose random shoe
            shoeIndex = this.getRandomShoe();

            // create shoe
            shoe = new namespace.PixiLayer_Shoe({
                resource: Assets.getShoeResource(shoeIndex)
            });

            // set index and override render method
            shoe.index = shoeIndex;
            shoe.render = null;

            // increase delta
            this.shoesAdded++;

            // add to wrapper
            return container.add(shoe);
        },

        positionShoe: function(shoe, container) {
            var self = this,
                scale = container.scale.x;

            // always anchor bottom
            shoe.sprite.anchor.set(0, 1);

            // move to back
            shoe.x += (- State.currentViewportWidth / scale / 2 - shoe.width) * (container.children.length - 1);
        },

        replaceShoe: function(shoe, container) {
            // remove shoe index, who cares which it is
            this.shoesOn.shift();

            // remove
            container.removeChild(shoe);

            // add
            shoe = this.addShoe(container);
            this.positionShoe(shoe, container);
        },

        getRandomShoe: function() {
            var index = ~~ (Math.random() * Assets.data.shoes.length);

            if (this.shoesOn.indexOf(index) > -1) {
                // console.warn("Duplicate shoe found!", this.shoesOn);
                return this.getRandomShoe();
            }
            else {
                this.shoesOn.push(index);
                return index;
            }
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            var self = this,
                shoe,
                container;

            var containers = ['top-1', 'top-2', 'top-3', 'bottom-1', 'bottom-2', 'bottom-3'];

            containers.forEach(function(name) {
                container = self.get(name);

                for (var i = 0, l = self.MAX_SHOES_PER_ROW; i < l; i ++) {
                    shoe = self.addShoe(container);
                    self.positionShoe(shoe, container);
                }
            });
        },

        animateOut: function() {
            // fade outtouch
            this.get('touch-to-begin').dalpha = 0;

            setTimeout(function(s) {
                s.visible = false;
                s.trigger(Events.ANIMATE_OUT);
            }, 250, this);
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            var self = this;

            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            this.y = this.dy;
            this.x = this.dx;

            // move shoes
            var containers = ['top-1', 'top-2', 'top-3', 'bottom-1', 'bottom-2', 'bottom-3'],
            // var containers = ['bottom-3'],
                container,
                shoe,
                speed;
                // speed = 15;

            containers.forEach(function(name) {
                container = self.get(name);
                speed = 3 * container.scale.x;

                for (var i = 0, l = self.MAX_SHOES_PER_ROW; i < l; i ++) {
                    shoe = container.getChildAt(i);
                    shoe.x += speed;
                }
            });

            containers.forEach(function(name) {
                container = self.get(name);

                shoe = container.getChildAt(0);

                if (shoe.x > State.currentViewportWidth / container.scale.x) {
                    self.replaceShoe(shoe, container);
                }
            });
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onClick: function(e) {
            this.animateOut();
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_AttractLoop
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_AttractLoop = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'attract loop',

        // <Boolean> Set events to be on
        interactive: true,

        // <String> Mode for alternate
        mode: 'main',

        // <PIXI_Rect>
        hitArea: new PIXI.Rectangle(0, 0, State.currentViewportWidth, State.currentViewportHeight),

        // <Interval>
        interval: null,


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add elements
            this.add(new namespace.PixiLayer_Jumpman2,     'jumpman');
            this.add(new namespace.PixiLayer_TouchToBegin, 'touch-to-begin');
            this.add(new namespace.PixiLayer_GridNumeral,  'grid');

            this.interval = setInterval(function(s) {
                s.alternate();
            }, 1000 * 5, this);

            // this.alternate();
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            this.get('jumpman').animateIn();
        },

        animateOut: function() {
            // fade outtouch
            this.get('grid').animateOut();
            this.get('jumpman').animateOut();
            this.get('touch-to-begin').dalpha = 0;

            setTimeout(function(s) {
                s.visible = false;
                s.trigger(Events.ANIMATE_OUT);
            }, 250, this);

            clearInterval(this.interval);
            this.interval = null;
        },

        alternate: function() {
            if (this.mode == 'grid') {
                this.gotoMain();
            }
            else {
                this.gotoGrid();
            }
        },

        gotoGrid: function() {
            this.mode = 'grid';

            setTimeout(function(s) {
                s.get('grid').animateIn();
            }, 400, this);

            this.get('jumpman').animateOut();
            this.get('touch-to-begin').animateOut();
        },

        gotoMain: function() {
            this.mode = 'main';

            this.get('grid').animateOut( 0, true );

            setTimeout(function(s) {
                s.get('jumpman').animateIn();
                s.get('touch-to-begin').animateIn();
            }, 400, this);
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            this.y = this.dy;
            this.x = this.dx;

            this.get('touch-to-begin').render();
            this.get('jumpman').render();
            this.get('grid').render();
        },

        update: function() {
            this.get('grid').update();

            this.get('jumpman').update();

            this.get('jumpman').x = State.currentViewportWidth / 2;
            this.get('jumpman').y = State.currentViewportHeight / 2;

            this.get('touch-to-begin').dx = State.currentViewportWidth / 2;
            // scaled 75 is from the jumpman text
            this.get('touch-to-begin').dy = this.get('jumpman').y + this.get('jumpman').text.y + this.get('touch-to-begin').height * 0.75;
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onClick: function(e) {
            this.animateOut();
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Background
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Background = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'background',

        // <PIXI_Sprite> Background image
        sprite: null,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            var backgroundType = options.type ? options.type : "";

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // create background image
            this.sprite = new PIXI.Sprite.fromImage(Constants.IMAGE_HOST + '/misc/site-bg' + backgroundType + '.jpg');

            if (!backgroundType) {
                this.sprite.alpha = 0;
            }

            // add to stage
            this.add(this.sprite);
        },


        // Display
        // -------------------------------------------------------------------

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // size to fit
            this.sprite.width = State.currentViewportWidth;
            this.sprite.height = State.currentViewportHeight;
        },


        // Animation
        // ------------------------------------------------------------------

        animateIn: function() {
            $(this.sprite).animate({
                alpha: 1
            }, 500);
        },

        animateOut: function() {
            $(this.sprite).animate({
                alpha: 0
            }, 500);
        },

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_CaptionBox
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_CaptionBox = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'caption box',

        // <PIXI_Text>
        caption1: null,

        // <PIXI_Text>
        caption2: null,

        // <Integer>
        fontSize: 40,

        // <PIXI_Graphics>
        divider: null,

        // <Integer>
        marginTop: 100,

        // <PIXI_Graphics>
        box: null,

        // <Integer> Box sizes
        boxMask    : null,
        boxMaskMask: null,
        boxWidth   : 380,
        boxHeight  : 215,
        boxStroke  : 5,

        interactive: false,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // bindings
            // _.bindAll(this, 'onMouseIdle' /*'onClickArrowLeft', 'onClickArrowRight'*/);

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // asset
            this.box     = new PIXI.Graphics;
            this.boxMask = new PIXI.Graphics;
            this.divider = new PIXI.Graphics;

            this.caption1 = new namespace.PixiLayer_CaptionBox_Text({
                ix      : ~~ (this.getBoxWidth() / 2),
                iy      : ~~ (this.getBoxHeight() * 0.25),
                fontSize: this.fontSize
            });

            this.caption2 = new namespace.PixiLayer_CaptionBox_Text({
                ix      : ~~ (this.getBoxWidth() / 2),
                iy      : ~~ (this.getBoxHeight() / 2 + this.getBoxHeight() * 0.25),
                fontSize: this.fontSize + 15
            });

            this.divider.x = (this.getBoxWidth() * 0.25) / 2;
            this.divider.y = this.getBoxHeight() / 2;

            this.drawBox(Colors.BLACK);
            this.drawBoxMask();
            this.drawDivider(Colors.BLACK);

            //
            this.setHard('alpha', 0);

            // assets
            this.add(this.caption1,   'caption1',    null, 'suppressLog');
            this.add(this.caption2,   'caption2',    null, 'suppressLog');
            // this.add(this.arrowLeft,  'arrow-left',  null, 'suppressLog');
            // this.add(this.arrowRight, 'arrow-right', null, 'suppressLog');
            this.add(this.divider,    'divider',     null, 'suppressLog');
            this.add(this.box,        'box',         null, 'suppressLog');
        },

        attachEvents: function() {
            this.caption1.attachEvents();
            this.caption2.attachEvents();
        },

        detachEvents: function() {
            this.caption1.detachEvents();
            this.caption2.detachEvents();

        },

        drawBox: function(color) {
            this.box.clear();
            this.box.lineStyle(this.getBoxStroke(), color)
                    .drawRect(0, 0, this.getBoxWidth(), this.getBoxHeight());
        },

        drawBoxMask: function() {
            this.boxMask.clear();
            this.boxMask.beginFill(0xFFFFFF)
                .drawRect(-5, -5, this.getBoxWidth() + 5, this.getBoxHeight() + 5)
                .endFill();

            // this.boxMask.pivot.x = this.box.width / 2;
            this.boxMask.pivot.x = scaled(30);
            this.boxMask.pivot.y = this.getBoxHeight() / 2;

            // this.boxMask.x = this.box.width / 2;
            this.boxMask.x = scaled(30);
            this.boxMask.y = this.getBoxHeight() / 2;

            this.box.mask = this.boxMask;

            this.add(this.boxMask);
        },

        drawDivider: function(color) {
            this.divider.clear()
                        .beginFill( color )
                        .drawRect( 0, 0, this.getBoxWidth() * 0.75, this.getBoxStroke() )
                        .endFill();
        },

        setCaptions: function(caption1, caption2, direction) {
            direction || (direction = 'Down');

            // this provides stagger, which we wanted and now we don't
            // var delay = 150;
            var delay = 0;

            // @todo, stagger these animations
            setTimeout(function(scope) {
                scope.caption1['animateToText' + direction]( caption1.toUpperCase() );
            }, direction == 'Down' ? 0 : delay, this);

            setTimeout(function(scope) {
                scope.caption2['animateToText' + direction]( caption2.toUpperCase() );
            }, direction == 'Up' ? 0 : delay, this);
        },

        setGold: function() {
            this.caption1.setGold();
            this.caption2.setGold();
            this.drawBox(Colors.GOLD);
            this.drawDivider(Colors.GOLD);
        },

        setBlack: function() {
            this.caption1.setBlack();
            this.caption2.setBlack();
            this.drawBox(Colors.BLACK);
            this.drawDivider(Colors.BLACK);
        },

        /**
         * Note: This code is total garbage and needs to be re-written
         *       if we can figure out knockout masks, this will be a lot
         *       easier / cleaner
         */
        animateBox: function(speed) {
            var self = this,
                f   = 0xff0000,
                f2  = 0xffff00,
                f3  = 0xff00ff,
                bm  = this.boxMask,
                b   = this.box,
                w   = this.box.width - 10,
                x   = -5,
                y   = -5,
                h   = this.box.height - 10,
                lw  = 10,
                obj = {
                    r: 0,
                    x: 0,
                    y: 0,
                    scale: 1.5
                };

            // hide masking
            // this.box.mask = null;

            // make box visible
            this.box.visible = true;

            // Shit show of line animation because we don't have knockout masks
            // in pixi apparently
            $(obj).animate(
                { r: 1 },
                {
                    duration: 1000  * Constants.DO_ANIMATE * (speed || 0.75),
                    step: function() {
                        var r = obj.r,
                            r1 = Math.min(1, Math.max(0, r * 1.5)),
                            r2 = Math.min(1, Math.max(0, r * 2)),
                            r3 = Math.min(1, Math.max(0, r * 3));

                        bm.clear();

                        // top
                        bm.beginFill(f).drawRect(
                            w * r3 * 2.3,
                            y,
                            w,
                            10
                        );
                        bm.beginFill(f2).drawRect(
                            - w / 2,
                            y,
                            w * r3 * 2,
                            10
                        );

                        // right
                        bm.beginFill(f).drawRect(
                            w,
                            - h + (y + h * 2.2) * r3,
                            10,
                            h * 2.2 - 10
                        );
                        bm.beginFill(f2).drawRect(
                            w,
                            - h * 2.4 + (y + h * 2.4) * r3,
                            10,
                            h * 1.5 * r2
                        );

                        // bottom
                        bm.beginFill(f).drawRect(
                            x,
                            h,
                            (w * 2.4) - (w * 2.4 * r2),
                            10
                        );
                        bm.beginFill(f2).drawRect(
                            x + (w * 3) - (w * 3 * r1),
                            h,
                            w + lw,
                            10
                        );

                        // left
                        bm.beginFill(f).drawRect(
                            x,
                            y,
                            10,
                            (h * 3.6) - (h * 3.6) * r1
                        );
                        bm.beginFill(f2).drawRect(
                            x,
                            y + (h * 3) - (h * 3 * r1) * r,
                            10,
                            h + 10
                        );
                    }
                }
            );
        },

        // hideArrows: function() {
        //     this.animateArrowsOut();
        // },

        // showArrows: function() {
        //     this.animateArrowsIn();
        // },


        // Getters
        // -------------------------------------------------------------------

        getBoxWidth: function() {
            return scaled(this.boxWidth);
        },

        getBoxStroke: function() {
            return scaled(this.boxStroke);
        },

        getBoxHeight: function() {
            return scaled(this.boxHeight);
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // y, x
            this.x     = (State.currentViewportWidth / 2) - (this.getBoxWidth() / 2);
            this.y     = scaled(this.marginTop);
            this.alpha = this.alpha - (this.alpha - this.dalpha) * 0.1;
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function(options, callback) {
            var self = this;

            console.color("[caption-box] Animating in", Colors.ANIMATION);

            // Alpha
            this.dalpha = 1;
            this.interactive = false;
            this.caption1.visible = true;
            this.caption2.visible = true;

            // Animate Divider
            this.divider.scale.x = this.divider.ds = 0;

            $(this.divider).animate({
                ds: 1
            }, {
                duration: 1000  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : "easeOutQuart"),
                step: function(value) {
                    self.divider.scale.x = value;
                    self.divider.alpha = value;
                    self.box.alpha = value;
                },
                complete: function() {
                    self.interactive = true;

                    callback && callback();
                }
            });
        },

        animateOut: function(options, callback) {
            options || (options = {});
            options.duration || (options.duration = 1000);

            var self = this;

            console.color("[caption-box] Animating out", Colors.ANIMATION);

            // unset captions
            this.setCaptions("", "");

            //
            this.interactive = false;

            // animate out divider
            return $(this.divider).animate({
                ds: 0
            }, {
                duration: options.duration  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : "easeOutQuart"),
                step: function(value) {
                    self.box.alpha       = value;
                    self.divider.alpha   = value;
                    self.divider.scale.x = value;
                    // self.arrowLeft.alpha = self.arrowRight.alpha = value;
                },
                complete: function() {
                    self.alpha = 0;
                    self.caption1.visible   = false;
                    self.caption2.visible   = false;
                    // self.arrowLeft.visible  = false;
                    // self.arrowRight.visible = false;
                    self.interactive = true;

                    callback && callback();
                }
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Carousel
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Carousel = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'carousel',

        // <Integer> The last index we locked at
        lastLockedIndex: 0,

        // <Boolean> If we have exceeded the threshold limit and decided to lock
        isLocking: false,

        // <Boolean> If we even want to be able to lock
        shouldLock: false,

        // <Integer> How far margins are in for arrows
        ARROW_MARGIN: 100,

        // <Boolean> If we should disable interactivity
        ALLOW_MOTION: true,

        // <Boolean> Tells us that we have exceeded an inertia threshold
        LOCKING_THRESHOLD: 100,

        // <Integer> Maximum inertia left until we take over and lock up
        INERTIA_THRESHOLD: 40,

        // <Boolean> Allow the throw to lock into position
        ALLOW_LOCKING: true,


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // bindings
            _.bindAll(this, 'onClickArrowLeft', 'onClickArrowRight', 'onLockShoe');
            _.bindAll(this, 'onCarouselRequestNext', 'onCarouselRequestPrevious');
            _.bindAll(this, 'onMouseIdle', 'onMotion', 'onResize');

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // set starting position
            this.x = State.currentViewportWidth;

            // assets
            this.add(new namespace.PixiLayer_ShoeWrapper, 'wrapper');
            this.add(new namespace.PixiLayer_Arrow,       'arrow-left');
            this.add(new namespace.PixiLayer_Arrow,       'arrow-right');

            // flip arrow
            this.get('arrow-left').setScale(0.5);
            this.get('arrow-right').setScale(0.5);
            this.get('arrow-right').flip();

            // add shoes
            this.addShoes();

            // mask
            this.createMask();
        },

        attachEvents: function() {
            this.get('arrow-left').on(Events.CLICK_LAYER, this.onClickArrowLeft);
            this.get('arrow-right').on(Events.CLICK_LAYER, this.onClickArrowRight);

            this.get('arrow-left').on(Events.CLICK_LAYER, this.onMotion);
            this.get('arrow-right').on(Events.CLICK_LAYER, this.onMotion);
            namespace.on(Events.CAROUSEL_NEXT, this.onMotion);
            namespace.on(Events.CAROUSEL_PREVIOUS, this.onMotion);

            this.on(Events.LOCK_SHOE, this.onLockShoe);
            namespace.on(Events.CAROUSEL_NEXT, this.onCarouselRequestNext);
            namespace.on(Events.CAROUSEL_PREVIOUS, this.onCarouselRequestPrevious);
            namespace.on(Events.RESIZE, this.onResize);
            namespace.on(Events.MOUSE_IDLE, this.onMouseIdle);
        },

        detachEvents: function() {
            this.get('arrow-left').off(Events.CLICK_LAYER, this.onClickArrowLeft);
            this.get('arrow-right').off(Events.CLICK_LAYER, this.onClickArrowRight);

            this.get('arrow-left').off(Events.CLICK_LAYER, this.onMotion);
            this.get('arrow-right').off(Events.CLICK_LAYER, this.onMotion);
            namespace.off(Events.CAROUSEL_NEXT, this.onMotion);
            namespace.off(Events.CAROUSEL_PREVIOUS, this.onMotion);

            this.off(Events.LOCK_SHOE, this.onLockShoe);
            namespace.off(Events.CAROUSEL_NEXT, this.onCarouselRequestNext);
            namespace.off(Events.CAROUSEL_PREVIOUS, this.onCarouselRequestPrevious);
            namespace.off(Events.RESIZE, this.onResize);
            namespace.off(Events.MOUSE_IDLE, this.onMouseIdle);
        },

        createMask: function() {
            var g = new PIXI.Graphics;
                g.beginFill(0xFF0000)
                 .drawRect(0, 0, State.currentViewportWidth, State.currentViewportHeight)
                 .endFill();

            this.mask = g;
            this.add(g, 'mask', null, 'suppressLog');
        },

        addShoes: function() {
            var shoe, wrapper;

            // container for shoes
            wrapper = this.get('wrapper');

            // add shoes to container
            Assets.each(function(item, index) {

                wrapper.add(new namespace.PixiLayer_Carousel_Shoe({
                    resource: Assets.getShoeResource(index)
                }), 'shoe' + index, null, 'suppressLog');

            }, this);

            // layout shoes based on current viewport
            this.layoutShoes();
        },

        layoutShoes: function() {
            var shoe, wrapper;

            // container for shoes
            wrapper = this.get('wrapper');

            // layout shoes in container
            _.each(Assets.data.shoes, function(item, index) {

                wrapper.get('shoe' + index).x = State.currentViewportWidth * index;

            }, this);
        },

        goNext: function() {
            if (this.lastLockedIndex < Assets.data.shoes.length - 1) {
                this.dx = Math.round( this.dx / State.currentViewportWidth ) * State.currentViewportWidth;
                this.dx -= State.currentViewportWidth;
            }
        },

        goPrevious: function() {
            if (this.lastLockedIndex > 0) {
                this.dx = Math.round( this.dx / State.currentViewportWidth ) * State.currentViewportWidth;
                this.dx += State.currentViewportWidth;
            }
        },

        goTo: function(index) {
            // this.dx = Math.round( this.dx / State.currentViewportWidth ) * State.currentViewportWidth;
            this.dx = this.get('wrapper').x = - State.currentViewportWidth * index;
            State.carouselDX = this.dx;
        },

        hideArrows: function() {
            this.get('arrow-left').dalpha = 0;
            this.get('arrow-right').dalpha = 0;
        },

        showArrows: function() {
            this.get('arrow-left').dalpha = 1;
            this.get('arrow-right').dalpha = 1;
        },

        showAJ1censor: function() {
            var self = this;

            this.aj1censor = setTimeout(function() {
                self.get('wrapper shoe0').showCensor();
            }, 1000 * 2);
        },

        cancelAJ1censor: function() {
            clearTimeout(this.aj1censor);
            this.aj1censor = null;
        },

        uncensor: function() {
            var shoe = this.get('wrapper shoe0');

            if (shoe.isCensored()) {
                shoe.hideCensor();
            }
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            var wrapper = this.get('wrapper');

            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // carousel position

            //wrapper.y = this.dy; //MH - where the carousel easing takes place - problem is it is constantly setting the wrapper position, and that position is changing for too long when you navigate between shoes
            //wrapper.x = rt(wrapper.x - (wrapper.x - this.dx) * 0.1); //MH - where the carousel easing takes place - problem is it is constantly setting the wrapper position, and that position is changing for too long when you navigate between shoes

            //MH - I'm sure there's a better way to do this, but this code avoids having to set the wrapper position every frame:

            if (wrapper.y != this.dy){ //if there's a reason to update the shoe y position (window resize, initial position), then update it here
                wrapper.y = this.dy;
            }

            if (State.mouse.inertiaX != 0){ //if we're clicking an arrow
                if (State.mouse.inertiaX < 0){ //next
                    if (this.dx < Math.floor(wrapper.x)){
                        wrapper.x = rt(wrapper.x - (wrapper.x - this.dx) * 0.1); // move the wrapper from its current position to the new, eased position //MH - the pixel distance becomes so minimal after this point, updating wrapper position is not useful - not sure if the need to calculate Mat.floor makes this conditional worthwhile though
                    }
                } else if (State.mouse.inertiaX > 0){ //prev
                    if (this.dx > Math.ceil(wrapper.x)){
                        wrapper.x = rt(wrapper.x - (wrapper.x - this.dx) * 0.1); // move the wrapper from its current position to the new, eased position //MH - the pixel distance becomes so minimal after this point, updating wrapper position is not useful - not sure if the need to calculate Mat.floor makes this conditional worthwhile though
                    }
                }
            } else { //if we're dragging the carousel
                if (State.direction == 1){ //next
                    if (this.dx < Math.floor(wrapper.x)){
                        wrapper.x = rt(wrapper.x - (wrapper.x - this.dx) * 0.1); // move the wrapper from its current position to the new, eased position //MH - the pixel distance becomes so minimal after this point, updating wrapper position is not useful - not sure if the need to calculate Mat.floor makes this conditional worthwhile though
                    }
                } else if (State.direction == -1){ //prev
                    if (this.dx > Math.ceil(wrapper.x)){
                        wrapper.x = rt(wrapper.x - (wrapper.x - this.dx) * 0.1); // move the wrapper from its current position to the new, eased position //MH - the pixel distance becomes so minimal after this point, updating wrapper position is not useful - not sure if the need to calculate Mat.floor makes this conditional worthwhile though
                    }
                }
            }

            //END MH

            // state
            State.carouselX       = wrapper.x;
            State.carouselDX      = this.dx;
            State.carouselRatioX  = rt( Math.abs(wrapper.x / State.currentViewportWidth / (Assets.data.shoes.length - 1)) ) || 0;
            State.carouselRatioDX = rt( Math.abs(this.dx / State.currentViewportWidth / (Assets.data.shoes.length - 1)) ) || 0;
            State.lastLockedIndex = this.lastLockedIndex;
            namespace.trigger(Events.CAROUSEL_X, State.carouselX, State.carouselRatioX, this.lastLockedIndex);

            // arrow position
            this.get('arrow-left').x = scaled(this.ARROW_MARGIN);
            this.get('arrow-left').y = State.currentViewportHeight / 8 * 5;

            this.get('arrow-right').x = State.currentViewportWidth - scaled(this.ARROW_MARGIN);
            this.get('arrow-right').y = State.currentViewportHeight / 8 * 5;
        },

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // disable rendering
            if (!this.ALLOW_MOTION) {
                return false;
            }

            // hide arrows of mouse movement
            if (State.mouse.inertiaX) {
                !Flags.showArrows && this.hideArrows();

                this.onMotion();
            }

            // overall position
            // this.dy = State.currentViewportHeight / 2;
            this.dy = State.currentViewportHeight - scaled(485);

            // note: this is where we'd adjust for throw, mouse position, etc
            this.dx = Math.min(0, Math.max(this.dx + State.mouse.inertiaX, - State.currentViewportWidth * (Assets.data.shoes.length - 1) )); //MH - dx calculation happens here
            this.dx = rt(this.dx);

            // lock position
            if (this.ALLOW_LOCKING) {
                var lockedIndex;

                // if not currently locking, our slow inertia should be a trigger for locking
                if (this.isLocking == false && Math.abs(State.mouse.inertiaX) >= this.LOCKING_THRESHOLD) {
                    this.shouldLock = true;
                }

                // lock on drop
                if (!State.mouse.down) {
                    this.shouldLock = true;
                }

                // check if we should start locking because of drag
                if (Math.abs(State.mouse.inertiaX) < this.INERTIA_THRESHOLD && this.shouldLock) {
                    this.isLocking = true;
                }

                // check if mousedown
                if (this.isLocking == false && State.mouse.down == false && this.shouldLock == false) {
                    this.isLocking = true;
                }

                // check locking positions
                // if not 0, if inertia is less than threshold, if we have exceeded threshold limits
                if (this.isLocking) {

                    lockedIndex = Math.abs( Math.round(this.dx / State.currentViewportWidth) );
                    lockedIndex = Math.max(0, Math.min(Assets.data.shoes.length - 1, lockedIndex));

                    // fix to a centered position
                    this.dx = Math.round( this.dx / State.currentViewportWidth ) * State.currentViewportWidth;

                    // disable inertia if we're locking it up
                    State.mouse.inertiaX = 0;

                    // cancel locking
                    this.isLocking = false;
                    this.shouldLock = false;

                    // event
                    if (lockedIndex != this.lastLockedIndex) {
                        this.trigger(Events.LOCK_SHOE, lockedIndex, lockedIndex > this.lastLockedIndex ? 1 : -1);
                    }

                }

            }

            // check position of dx for arrows
            if (this.dx == 0) {
                this.get('arrow-left').dalpha = 0;
            }

            if (this.dx == - State.currentViewportWidth * (Assets.data.shoes.length - 1)) {
                this.get('arrow-right').dalpha = 0;
            }
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            console.color("[carousel] Animating in", Colors.ANIMATION);

            this.x = State.currentViewportWidth;

            $(this).animate({
                x: 0
            }, {
                duration: 750  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : "easeOutBackLight")
            });

            // check position of dx for arrows
            if (this.lastLockedIndex == 0) {
                this.get('arrow-left').dalpha = 0;
            }
            else {
                this.get('arrow-left').dalpha = 1;
            }

            if (this.dx == - State.currentViewportWidth * (Assets.data.shoes.length - 1)) {
                this.get('arrow-right').dalpha = 0;
            }
            else {
                this.get('arrow-right').dalpha = 1;
            }

            //
            this.onLockShoe(this.lastLockedIndex);
        },

        animateOut: function() {
            console.color("[carousel] Animating Out", Colors.ANIMATION);

            // disable dragging and such
            this.ALLOW_MOTION = false;

            // animate out arrows
            this.get('arrow-left').animateOut();
            this.get('arrow-right').animateOut();

            // remove element after our current
            // we can use this if we have to remove the overall mask for speed
            // this.get('wrapper').remove('shoe' + (this.lastLockedIndex + 1));

            // animate off
            $(this).animate({
                x: - State.currentViewportWidth
            }, {
                duration: 750  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInBackLight')
            });
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onCarouselRequestNext: function(e) {
            this.onClickArrowRight(e);
        },

        onCarouselRequestPrevious: function(e) {
            this.onClickArrowLeft(e);
        },

        onClickArrowLeft: function(e) {
            this.goPrevious();
            this.showArrows();
        },

        onClickArrowRight: function(e) {
            this.goNext();
            this.showArrows();
        },

        onLockShoe: function(index) {
            var shoeData;

            // save new index
            this.lastLockedIndex = index;

            // get shoe data
            shoeData = Assets.data.shoes[index];

            // locked shoe
            if (index === 0) {
                this.showAJ1censor();
            }
            else {
                this.cancelAJ1censor();
            }
            this.showArrows(); //MH - shouldn't we show arrows as soon as we know we're locked?

            // log
            console.color("[carousel] We have locked at index: " + index, Colors.DEBUG);
        },

        onMotion: function() {
            this.uncensor();
        },

        onMouseIdle: function(level) {
            console.color("[c mouse] Idle : " + level, Colors.MOUSE);

            // bring arrows back
            if (level >= 1) {
                this.showArrows();
            }
        },

        onResize: function() {
            this.layoutShoes();

            this.mask.beginFill(0xFF0000)
             .drawRect(0, 0, State.currentViewportWidth, State.currentViewportHeight)
             .endFill();
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_GridIcon
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_GridIcon = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'grid icon',

        // <Integer> Box sizes
        boxColor  : 0x999999,
        boxSize   : 10,
        boxSpacing: 3,
        hoverColor: Colors.GOLD,

        // <Boolean> Set events to be on
        interactive: true,

        // <Integer> Margin from top
        //marginTop: 100,
        marginTop: 1380, //MH

        // <PIXI_Rectangle> Hit area
        //hitArea: new PIXI.Rectangle(0, 0, 10 * 3 + 3 * 2, 10 * 3 + 3 * 2), //MH - boxSize * 3 boxes plus boxSpacing * 2 spaces
        //hitArea: new PIXI.Rectangle(-10 * 3 + 3 * 2, -10 * 3 + 3 * 2, (10 * 3 + 3 * 2)*2, (10 * 3 + 3 * 2)*2), //MH - hit area double size of grid icon
        hitArea: new PIXI.Rectangle(-((Constants.GRID_BOX_SIZE * 3 + Constants.GRID_BOX_SPACE * 2) * (Constants.GRID_BOX_HIT / 2)),-((Constants.GRID_BOX_SIZE * 3 + Constants.GRID_BOX_SPACE * 2) * (Constants.GRID_BOX_HIT / 2)),(Constants.GRID_BOX_SIZE * 3 + Constants.GRID_BOX_SPACE * 2) * Constants.GRID_BOX_HIT,(Constants.GRID_BOX_SIZE * 3 + Constants.GRID_BOX_SPACE * 2) * Constants.GRID_BOX_HIT), //MH - hit area double size of grid icon


        // <Integer> Caption box width
        captionBoxWidth: 380,
        captionBoxHeight: 215,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // assets
            this.box(0, 0);
            this.box(1, 0);
            this.box(2, 0);

            this.box(0, 1);
            this.box(1, 1);
            this.box(2, 1);

            this.box(0, 2);
            this.box(1, 2);
            this.box(2, 2);

        },

        box: function(row, column) {
            var g = new PIXI.Graphics;
                g.clear()
                 .beginFill(this.boxColor)
                 .drawRect(0, 0, scaled(this.boxSize), scaled(this.boxSize))
                 .endFill();

            // position
            g.dx = g.ix = g.x = scaled(this.boxSize * row + (this.boxSpacing - 1) * row);
            g.dy = g.iy = g.y = scaled(this.boxSize * column + (this.boxSpacing - 1) * column);
            g.da = g.alpha = 0;

            // add to clip
            this.add(g, 'box', null, 'suppressLog');
        },

        setBoxColor: function(color) {
            for (var i = 0, l = this.children.length; i < l; i++) {
                setTimeout(function(scope, index) {

                    scope.getChildAt(index)
                         .clear()
                         .beginFill(color)
                         .drawRect(0, 0, scaled(scope.boxSize), scaled(scope.boxSize))
                         .endFill()

                }, 25 * i, this, i);
            }
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            for (var i = 0, l = this.children.length; i < l; i++) {
                setTimeout(function(scope, index) {

                    scope.getChildAt(index).da = 1;

                }, 250 + 50 * i, this, i);
            }
        },

        animateOut: function() {
            // set color
            this.setBoxColor(this.hoverColor);

            // move boxes
            for (var i = 0, l = this.children.length; i < l; i++) {
                setTimeout(function(scope, index) {

                    scope.getChildAt(index).dx = - 50;
                    scope.getChildAt(index).da = 0;

                }, 250 + 50 * i, this, i);
            }
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            var child;

            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            for (var i = 0, l = this.children.length; i < l; i++) {
                child = this.getChildAt(i);

                child.y     = ~~( child.y - (child.y - child.dy) * 0.05);
                child.x     = ~~( child.x - (child.x - child.dx) * 0.05);
                child.alpha = child.alpha - (child.alpha - child.da) * 0.2;
            }
        },

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            //
            //this.x = scaled(50);
            this.x = (namespace.State.currentViewportWidth/2) - this.width / 2; //MH
            this.y = scaled(this.marginTop + this.captionBoxHeight / 2) - this.height / 2;
        },


        // Mouse Events
        // -------------------------------------------------------------------

        onMouseOver: function() {
            this.setBoxColor(this.hoverColor);
        },

        onMouseOut: function() {
            this.setBoxColor(this.boxColor);
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Grid
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_GridNumeral = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'grid-numeral',

        // <Integer> Amount of rows in grid
        rowCount: 4,

        // <Integer>
        margin: 0,

        // <Integer>
        marginTop: 125,

        // <Integer>
        startScale: 1.0,

        // <Array>
        numbers: [ 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XX1', 'XX2', 'XX3', '2009', '2010', '2011', '2012', 'XX8', 'XX9', 'XXX', 'XXXI' ],


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add items
            Assets.each(function(item, index) {
                var gridItem = new namespace.PixiLayer_Numeral({
                    number: this.numbers[index]
                });

                gridItem.visible = false;

                this.add(gridItem, 'grid' + index, null, 'suppressLog');
            }, this);
        },

        attachEvents: function() {

        },

        detachEvents: function() {

        },


        // Getters
        // -------------------------------------------------------------------

        getGridPosition: function(index) {
            var row        = ~~ (index % this.rowCount),
                column     = ~~ (index / this.rowCount),
                colCount   = Math.ceil(Assets.data.shoes.length / this.rowCount);

            return {
                x: this.getGridItemWidth() * row,
                y: this.getGridItemHeight() * column,
                width: this.getGridItemWidth(),
                height: this.getGridItemHeight()
            };
        },

        getGridItemWidth: function() {
            return State.currentViewportWidth * 0.75 / this.rowCount;
        },

        getGridItemHeight: function() {
            var margin = scaled(this.marginTop * 2);

            return (State.currentViewportHeight - margin) / Math.ceil(Assets.data.shoes.length / this.rowCount);
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            _(Assets.data.shoes).each(function(item, index) {

                var gridItem = this.get('grid' + item.id),
                    pos      = this.getGridPosition(item.id);

                    gridItem.setHard('x', pos.x + pos.width / 2);
                    gridItem.setHard('y', pos.y + pos.height / 2);
                    gridItem.setScale(1);

                    gridItem.alpha   = 0;
                    gridItem.visible = true;

                    $(gridItem).delay( ~~(index / 4) * 50).animate({
                        alpha: 1
                    }, 500);


            }, this);
        },

        animateOut: function(index, sendEvent) {
            _(Assets.data.shoes).each(function(item, index) {

                var gridItem = this.get('grid' + item.id),
                    pos      = this.getGridPosition(item.id);

                $(gridItem).delay( ~~(index / 4) * 50).animate({
                    alpha: 0
                }, 500);

            }, this);
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // move grid
            this.y = ~~ this.dy;
            this.x = ~~ this.dx;
        },

        update: function() {
            var marginTop = scaled(this.marginTop);

            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // overall position
            // @todo add margin here
            this.dy = marginTop;

            // debug markers mess this up, obviously
            // we add half grid width because we center the shoes at 0.5, 0.5
            this.dx = (State.currentViewportWidth / 2) - (this.getGridItemWidth() * 2);
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Grid
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Grid = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'grid',

        // <Integer> Amount of rows in grid
        rowCount: 4,

        // <Integer>
        margin: 0,

        // <Integer>
        marginTop: 125,

        // <Integer>
        startScale: 1.0,


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // bindings
            _.bindAll(this, 'onClickGridItem');

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add items
            Assets.each(function(item, index) {
                var gridItem = new namespace.PixiLayer_Grid_Shoe({
                    index: index
                });

                gridItem.visible = false;

                this.add(gridItem, 'grid' + index, null, 'suppressLog');
            }, this);
        },

        attachEvents: function() {
            Assets.each(function(item, index) {
                this.get('grid' + index).on(Events.CLICK_LAYER, this.onClickGridItem);
            }, this);
        },

        detachEvents: function() {
            Assets.each(function(item, index) {
                this.get('grid' + index).off(Events.CLICK_LAYER, this.onClickGridItem);
            }, this);
        },


        // Getters
        // -------------------------------------------------------------------

        getGridPosition: function(index) {
            var row        = ~~ (index % this.rowCount),
                column     = ~~ (index / this.rowCount),
                colCount   = Math.ceil(Assets.data.shoes.length / this.rowCount);

            return {
                x: this.getGridItemWidth() * row,
                y: this.getGridItemHeight() * column
            };
        },

        getGridItemWidth: function() {
            return State.currentViewportWidth * 0.75 / this.rowCount;
        },

        getGridItemHeight: function() {
            var margin = scaled(this.marginTop * 2);

            return (State.currentViewportHeight - margin) / Math.ceil(Assets.data.shoes.length / this.rowCount);
        },


        // Animation
        // -------------------------------------------------------------------

        // animateIn: function() {
        //     var shoes = _.shuffle(Assets.data.shoes.slice(0));

        //     _(shoes).each(function(item, index) {

        //         var gridItem = this.get('grid' + item.id),
        //             pos      = this.getGridPosition(item.id);

        //         // setTimeout(function(scope) {

        //             gridItem.pivot.set(0.5, 0.5);

        //             gridItem.setSize(this.getGridItemWidth(), this.getGridItemHeight());
        //             gridItem.setHard('x', pos.x);
        //             gridItem.setHard('y', pos.y);
        //             gridItem.setScale(1);
        //             gridItem.setInteractive();
        //             gridItem.shoe.setScale( gridItem.shoe.scale.x - 0.05 );

        //             gridItem.shoe.alpha   = 0;
        //             gridItem.alpha   = 0;
        //             gridItem.dscale  = 1;
        //             gridItem.dalpha  = 1;
        //             gridItem.visible = true;
        //             gridItem.animateIn();

        //         // }, 100 * (index / 4), this);

        //     }, this);
        // },

        animateIn: function() {
            _(Assets.data.shoes).each(function(item, index) {

                var gridItem = this.get('grid' + item.id),
                    pos      = this.getGridPosition(item.id);

                // setTimeout(function(scope) {

                    gridItem.pivot.set(0.5, 0.5);

                    gridItem.setSize(this.getGridItemWidth(), this.getGridItemHeight());
                    gridItem.setHard('x', pos.x);
                    gridItem.setHard('y', pos.y);
                    gridItem.setScale(1);
                    gridItem.setInteractive();
                    gridItem.shoe.setScale( gridItem.shoe.scale.x - 0.05 );

                    gridItem.shoe.alpha   = 0;
                    gridItem.alpha   = 0;
                    gridItem.dscale  = 1;
                    // gridItem.dalpha  = 1;
                    gridItem.visible = true;
                    // gridItem.animateIn();

                    setTimeout(function(s){
                        gridItem.animateIn()
                    }, ~~(index / 4) * 30);

                // }, 100 * (index / 4), this);

            }, this);
        },

        animateOut: function(index, sendEvent) {
            var self = this,
                i, l, n, d, _shoe, pos, sl;

            //
            sl = Assets.data.shoes.length - 1;
            pos = Math.max( sl - index, index );

            // scale up
            _shoe = this.get('grid' + index);

            // front to back
            index >= 0 && this.animateOutFromFront(index);

            // back to front
            this.animateOutFromBack(index);

            // main shoe
            $(_shoe).delay(pos / 4 * 50 + 150).animate({
                alpha: 0,
                dalpha: 0
            }, 500, function() {
                sendEvent && self.trigger(Events.ANIMATE_OUT);
            });
        },

        animateOutFromFront: function(toIndex) {
            toIndex || (toIndex = 0);

            var i, n, l, pos;

            //
            for (i = 0, n = 0, l = toIndex; i < l; i += 4) {
                n++;
                (i + 0 < toIndex) && setTimeout(this.animateShoeTo, 50 * n + 0, this, i, 0);
                (i + 1 < toIndex) && setTimeout(this.animateShoeTo, 50 * n + 50, this, i + 1, 0);
                (i + 2 < toIndex) && setTimeout(this.animateShoeTo, 50 * n + 100, this, i + 2, 0);
                (i + 3 < toIndex) && setTimeout(this.animateShoeTo, 50 * n + 150, this, i + 3, 0);
            }
        },

        animateOutFromBack: function(toIndex) {
            toIndex || (toIndex = 0);

            var i, n, l, pos;

            i  = Assets.data.shoes.length - 1;
            i += 4 - (i % 4);

            //
            for (i = i, l = toIndex, n = 0; i > l; i -= 4) {
                (i - 1 > toIndex) && setTimeout(this.animateShoeTo, 50 * n + 0, this, i - 1, 0);
                (i - 2 > toIndex) && setTimeout(this.animateShoeTo, 50 * n + 50, this, i - 2, 0);
                (i - 3 > toIndex) && setTimeout(this.animateShoeTo, 50 * n + 100, this, i - 3, 0);
                (i - 4 > toIndex) && setTimeout(this.animateShoeTo, 50 * n + 150, this, i - 4, 0);
            }
        },

        animateShoeTo: function(scope, index, alpha) {
            var shoe, pos;

            if (shoe = scope.get('grid' + index)) {
                pos  = scope.getGridPosition(index);

                shoe.dalpha = alpha;
            }
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // move grid
            this.y = ~~ this.dy;
            this.x = ~~ this.dx;
        },

        update: function() {
            var marginTop = scaled(this.marginTop);

            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // overall position
            // @todo add margin here
            this.dy = marginTop;

            // debug markers mess this up, obviously
            // we add half grid width because we center the shoes at 0.5, 0.5
            this.dx = (State.currentViewportWidth / 2) - (this.getGridItemWidth() * 2);
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onClickGridItem: function(e, shoe) {
            State.selectedGridItem = shoe.index;

            this.detachEvents();
            this.animateOut( shoe.index, true );
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_LogoJordan
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Jumpman2 = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'jumpman',

        // <PIXI_Sprite> Black Jordan
        sprite: null,

        // <Integer> Margin top
        marginTop: 125,

        // <Float> This is a fix for canvas renderer
        shrunkScale: 0.001,

        // <Integer>
        fontSize: 28,

        // <String> Caption of the jumpman
        caption: 'AIR JORDAN I - XXXI'.replace(/(.)(?=.)/g, '$1 '),


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add logo
            this.sprite = PIXI.Sprite.fromImage( Constants.IMAGE_HOST + '/logos/jumpman-black.png');

            //
            this.sprite.width = 200;
            this.sprite.height = 157;

            // size
            this.originalWidth = this.sprite.width;
            this.originalHeight = this.sprite.height;

            this.sprite.width = State.currentViewportWidth * 0.38;
            this.sprite.height = this.originalHeight * (this.sprite.width / this.originalWidth);
            // this.sprite.scale.y = this.sprite.scale.x;

            // this.sprite.width = State.currentViewportWidth * 0.31;
            // this.sprite.height = this.sprite.width / this.originalWidth * this.originalHeight;

            this.sprite.anchor.set(0.5, 1.0);

            // add
            this.add(this.sprite, 'black');


            this.text = new PIXI.Text(this.caption, {
                // font      : scaled(this.fontSize) + 'px "Jordan Druk"',
                font      : scaled(this.fontSize) + 'px "Jordan NHG Disp 75"',
                fill      : Colors.HEX_BLACK,
                lineHeight: 30,
                padding   : 5
            });

            // position
            this.text.anchor.set(0.5, 0.5);

            // add to stage
            this.add(this.text);
        },


        // Display
        // -------------------------------------------------------------------

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            //
            this.sprite.y = - scaled(10);

            //
            this.text.x = 0;
            this.text.y = scaled(145);
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            console.color("[jordan] Animating in", Colors.ANIMATION);

            $(this).animate({
                alpha: 1
            }, {
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInQuad')
            });
        },

        animateOut: function() {
            console.color("[jordan] Animating Out", Colors.ANIMATION);

            $(this).animate({
                alpha: 0
            }, {
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInQuad')
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_LogoJordan
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Jumpman = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'jumpman',

        // <PIXI_Sprite> Black Jordan
        spriteBlack: null,

        // <PIXI_Sprite> Gold Jordan
        spriteGold: null,

        // <Integer> Margin top
        //marginTop: 125,
        marginTop: 75, //MH

        // <Float> This is a fix for canvas renderer
        shrunkScale: 0.001,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add logo
            this.spriteBlack = PIXI.Sprite.fromImage( Constants.IMAGE_HOST + '/logos/jumpman-black.png');
            this.spriteGold = PIXI.Sprite.fromImage( Constants.IMAGE_HOST + '/logos/jumpman-gold.png');

            // size
            this.spriteBlack.width = this.spriteGold.width = 200;
            this.spriteBlack.height = this.spriteGold.height = 157;

            this.spriteGold.anchor.set(0.5, 1.0);
            this.spriteBlack.anchor.set(0.5, 1.0);

            // add
            this.add(this.spriteBlack, 'black');
            this.add(this.spriteGold, 'gold');

            //
            this.alpha = 0;

            // set
            this.setBlack();

            // create mask
            this.createMask();
        },

        setBlack: function() {
            this.spriteGold.alpha = 0;
            this.spriteBlack.alpha = 1;
        },

        setGold: function() {
            this.spriteGold.alpha = 1;
            this.spriteBlack.alpha = 0;
        },

        setNone: function() {
            this.spriteGold.alpha = 0;
            this.spriteBlack.alpha = 0;
        },

        createMask: function() {
            this.maskGraphic = new PIXI.Graphics;
            this.maskGraphic.beginFill(0xFF0000)
                             .drawRect( - State.currentViewportWidth / 2, - this.spriteBlack.height, State.currentViewportWidth, this.spriteBlack.height )
                             .endFill();

            // shrink mask for animation (using height will not work)
            this.maskGraphic.scale.y = this.shrunkScale;

            // mask
            this.mask = this.maskGraphic;
            this.add(this.maskGraphic, 'mask', null, 'suppressLog');
        },


        // Display
        // -------------------------------------------------------------------

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // position
            this.x = State.currentViewportWidth / 2;
            this.y = State.currentViewportHeight - scaled(this.marginTop);

            // scale
            this.setScale( vpScale() * 0.75 );
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            var self = this;

            console.color("[jordan] Animating in", Colors.ANIMATION);

            this.maskGraphic.scale.y = this.shrunkScale;

            $(this.maskGraphic).animate({
                alpha: 1,
                ds: 1
            }, {
                step: function(value) {
                    self.maskGraphic.scale.y = value;
                },
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE :  'easeInQuad')
            });

            $(this).animate({
                alpha: 1
            }, {
                duration: 250  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInQuad')
            });
        },

        animateOut: function() {
            var self = this;

            console.color("[jordan] Animating Out", Colors.ANIMATION);

            $(this.maskGraphic).animate({
                ds: this.shrunkScale
            }, {
                step: function(value) {
                    self.maskGraphic.scale.y = value;
                },
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeOutQuad')
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_MenuText
 *
 * @package LosYorkJordan
 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_MenuText = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'menu-text',

        // <PIXI_Sprite> Menu Text
        sprite: null,
        marginTop: 385, //MH - higher number equals higher up on screen(?)

        // <Float> This is a fix for canvas renderer
        shrunkScale: 0.001,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add logo
            if (Constants.LANGUAGE == 'CNS'){
                this.sprite = PIXI.Sprite.fromImage( Constants.IMAGE_HOST + '/chinese/menu-simple.png');
            } else {
                this.sprite = PIXI.Sprite.fromImage( Constants.IMAGE_HOST + '/chinese/menu-traditional.png');
            }


            // size
            this.sprite.width = 200;
            this.sprite.height = 37;

            this.sprite.anchor.set(0.5, 0);


            // add
            this.add(this.sprite, 'menu-text-sprite');

            //
            //this.alpha = 0;

        },

        // Display
        // -------------------------------------------------------------------

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // position
            this.x = State.currentViewportWidth / 2;
            this.y = State.currentViewportHeight - scaled(this.marginTop);

            // scale
            this.setScale( vpScale() * 0.75 );
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {

            console.color("[menu text] Animating in", Colors.ANIMATION);

            $(this).animate({
                alpha: 1
            }, {
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInQuad')
            });
        },

        animateOut: function() {

            console.color("[menu text] Animating Out", Colors.ANIMATION);

            $(this).animate({
                alpha: 0
            }, {
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInQuad')
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Shoe
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Numeral = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'numeral',

        // <Integer> Original height
        originalHeight: 0,

        // <Integer> Original width
        originalWidth: 0,

        // <Integer> Font size
        fontSize: 55,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // asset
            this.text = new PIXI.Text(options.number, {
                font      : scaled(this.fontSize) + 'px "Jordan NHG Disp 75"',
                fill      : Colors.HEX_BLACK,
                padding   : 5
            });

            // assets
            this.add(this.text, 'text');
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // y, x
            this.y = ~~( this.y - (this.y - this.dy) * 0.1);
            this.x = ~~( this.x - (this.x - this.dx) * 0.1);

            this.text.x = -this.text.width / 2;
            this.text.y = -this.text.height / 2 + scaled(25);

            // scale scale
            this.setScale( this.scale.x - (this.scale.x - this.dscale) * 0.1 );
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Paragraph
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Paragraph = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'paragraph',

        // <PIXI_Container> Description text
        text: null,

        lines: null,

        // <Integer> Height of each line in pixels
        lineHeight: 31,

        // <Integer>
        fontSize: 23,
        fontSize2: 23,

        // <Integer> Height of mask
        maskHeight: 250,

        // <Float> This is a fix for canvas renderer
        shrunkScale: 0.001,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            //
            this.lines = [];
            this.text = new namespace.Abstract_PixiLayer;

            // create mask
            this.createMask();

            //
            // this.alpha = 0;

            // add to stage
            this.add(this.text, 'text', null, 'suppressLog');
        },

        createText: function(text) {
            var ary, line;

            this.lines = [];
            this.text.removeChildren(); //MH - need to destroy?
            ary = text.split("\n");

            // add lines
            for (var i = 0, l = ary.length; i < l; i++) {
                line = this.addLine( ary[i], i );
                this.text.add(line);
            }
        },

        addLine: function(text, line) {

            /*var text = new PIXI.Text(text.trim(), {
                align: 'center',
                font : scaled(this.fontSize) + 'px ' + Constants.FONT_SHOE_DESCRIPTION,
                fill : Colors.HEX_BLACK
            });*/

            //multistyle text
            var text = new PIXI.MultiStyleText(text.trim(), {
                def : { //default font
                    align: 'center',
                    font: scaled(this.fontSize) + 'px "' + Constants.FONT_SHOE_DESCRIPTION + '"',
                    fill : Colors.HEX_BLACK
                },
                FONT2 : { //secondary font if specified in the data file
                    align: 'center',
                    font: scaled(this.fontSize) + 'px "' + Constants.FONT_SHOE_DESCRIPTION_2 + '"',
                    fill : Colors.HEX_BLACK
                }
            });

            text.y = scaled(this.lineHeight) * this.lines.length;
            text.anchor.set(0.5, 0);


            this.lines.push(text);

            return text;
        },

        createMask: function() {
            this.maskGraphic = new PIXI.Graphics;
            this.maskGraphic.beginFill(0xFF0000)
                             .drawRect( - State.currentViewportWidth / 2, 0, State.currentViewportWidth, scaled(this.maskHeight) )
                             .endFill();

            // shrink mask for animation (using height will not work)
            this.maskGraphic.scale.y = this.shrunkScale;

            // mask
            this.text.mask = this.maskGraphic;
            this.add(this.maskGraphic, 'mask', null, 'suppressLog');
        },

        setText: function(text) {
            this.alpha     = 0;
            this.createText( text.toUpperCase() );
        },

        setGold: function() {
            for (var i in this.lines) {
                this.lines[i].style.fill = Colors.HEX_GOLD;
            }
        },

        setBlack: function() {
            for (var i in this.lines) {
                this.lines[i].style.fill = Colors.HEX_BLACK;
            }
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // position
            this.x = this.dx; //~~( this.x - (this.x - this.dx) * 0.1 );
            this.y = this.dy;
            this.alpha = this.alpha - (this.alpha - this.dalpha) * 0.05 ;

            // font size
            // this.text.style.font       = scaled(this.fontSize) + 'px "Jordan NHG Disp 55 Roman"';
            // this.text.style.lineHeight = scaled(this.lineHeight);
        },

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // pos
            this.dx = State.currentViewportWidth / 2;

            // margin bottom is where jumpman is, then we need jumpman height,
            // + padding for paragraphs.. So these are currently estimated numbers
            //this.dy = State.currentViewportHeight - scaled(415);
             if (Constants.LANGUAGE == "CNT" || Constants.LANGUAGE == 'CNS'){ //MH - add room for menu text
                this.dy = State.currentViewportHeight - scaled(325);
             } else {
                this.dy = State.currentViewportHeight - scaled(365);
             }
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            var self = this;

            console.color("[paragraph] Animating in", Colors.ANIMATION);

            this.maskGraphic.scale.y = this.shrunkScale;

            $(this.maskGraphic).animate({
                ds: 1
            }, {
                step: function(value) {
                    self.maskGraphic.scale.y = value;
                },
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInQuad')
            });

            $(this).animate({
                alpha: 1
            }, {
                duration: 250  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInQuad' )
            });
        },

        animateOut: function() {
            var self = this;

            console.color("[paragraph] Animating Out", Colors.ANIMATION);

            $(this.maskGraphic).animate({
                ds: this.shrunkScale
            }, {
                step: function(value) {
                    self.maskGraphic.scale.y = value;
                },
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeOutQuad')
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_RomanNumeralsImage
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_RomanNumeralsImage = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'roman numerals image',


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // set starting position
            this.x = State.currentViewportWidth;

            // assets
            this.add(new namespace.PixiLayer_ShoeWrapper, 'wrapper');

            // add shoes
            this.addNumbers();

            // mask
            this.createMask();

            // layout shoes based on current viewport
            this.layoutNumbers();
        },

        createMask: function() {
            var g = new PIXI.Graphics;
                g.beginFill(0xFF0000)
                 .drawRect(0, 0, State.currentViewportWidth, State.currentViewportHeight)
                 .endFill();

            this.mask = g;
            this.add(g, 'mask', null, 'suppressLog');
        },

        addNumbers: function() {
            var wrapper;

            // container for shoes
            wrapper = this.get('wrapper');

            // add shoes to container
            if (Constants.SHADOWS){
                Assets.each(function(item, index) {
                    wrapper.add(new namespace.PixiLayer_Carousel_Numeral({
                        number: Assets.getYearResource(index),
                        shadow: Assets.getShadowResource(index)
                    }), 'number' + index, null, 'suppressLog');
                }, this);
            } else {
                Assets.each(function(item, index) {
                    wrapper.add(new namespace.PixiLayer_Carousel_Numeral({
                        number: Assets.getYearResource(index)
                    }), 'number' + index, null, 'suppressLog');
                }, this);
            }
        },

        layoutNumbers: function() {
            var number, wrapper;

            // container for shoes
            wrapper = this.get('wrapper');

            // layout shoes in container
            Assets.each(function(item, index) {
                number   = wrapper.get('number' + index);
                number.x = State.currentViewportWidth * index;
            }, this);
        },

        goTo: function(index) {
            this.dx = this.get('wrapper').x = - State.currentViewportWidth * index;
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            var wrapper = this.get('wrapper');

            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            wrapper.y = this.dy;
            // wrapper.x = ~~(wrapper.x - (wrapper.x - this.dx) * 0.075);
            wrapper.x = wrapper.x - (wrapper.x - this.dx) * 0.075;
        },

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // overall position
            this.dy = State.currentViewportHeight - scaled(530);
            this.dx = State.carouselDX;
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            console.color("[roman-numerals] Animating in", Colors.ANIMATION);

            this.x = State.currentViewportWidth;

            $(this).animate({
                x: 0
            }, {
                duration: 850  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeOutBackLight')
            });
        },

        animateOut: function() {
            console.color("[roman-numerals] Animating Out", Colors.ANIMATION);

            // index
            $(this).animate({
                x: - State.currentViewportWidth
            }, {
                duration: 850  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInOutQuad')
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_RomanNumeralsText
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_RomanNumeralsText = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'roman numerals text',

        // <PIXI_Text> Description text
        text: null,

        // <Integer>
        fontSize: 1000,

        // <Array> Index of roman numerals to number
        numeralIndex: [
            "I", "II", "III", "IV", "V",
            "VI", "VII", "VIII", "IX", "X",
            "XI", "XII", "XIII", "XIV", "XV",
            "XVI", "XVII", "XVII", "XIX", "XX",
            "XXI", "XXII", "XXIII", "XXIV", "XXV",
            "XXVI", "XXVII", "XXVII", "XXIX", "XXX"
        ],


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // create text
            this.text = new PIXI.Text(' ', {
                font         : this.fontSize + 'px "Jordan Druk"',
                fill         : Colors.HEX_BLACK
            });

            // position
            this.text.anchor.set(0.5, 1);

            // add to stage
            this.add(this.text);
        },

        setNumeral: function(index) {
            this.alpha = 0;
            this.da = 1;

            this.text.text = this.numeralIndex[index].toString().toUpperCase();
        },

        setGold: function() {
            this.text.style.fill = Colors.HEX_GOLD;
        },

        setBlack: function() {
            this.text.style.fill = Colors.HEX_BLACK;
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // position
            this.x = ~~( this.x - (this.x - this.dx) * 0.1);
            this.y = ~~( this.y - (this.y - this.dy) * 0.1);
            this.alpha = this.alpha - (this.alpha - this.da) * 0.05;

            // text
            this.text.style.font = scaled(this.fontSize) + 'px "Jordan Druk"';
        },

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // pos
            this.dx = State.currentViewportWidth / 2;
            this.dy = State.currentViewportHeight - scaled(530);
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_ShoeWrapper
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    namespace.PixiLayer_ShoeWrapper = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'shoe-wrapper'

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Shoe
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Shoe = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'shoe',

        // <PIXI_Sprite>
        sprite: null,

        // <Integer> Scale of shoes
        shoeScale: 0.75,

        // <Integer> Original height
        originalHeight: 0,

        // <Integer> Original width
        originalWidth: 0,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // asset
            this.sprite = new PIXI.Sprite(options.resource.texture);

            // resize
            this.sprite.height = 1024 / this.sprite.width * this.sprite.height;
            this.sprite.width = 1024;

            // stat
            this.originalWidth = this.sprite.width;
            this.originalHeight = this.sprite.height;

            // anchor
            this.sprite.anchor.set(0.5, 0.5);

            // set scale
            this.shoeScale = options.shoeScale || this.shoeScale;

            // scale down
            this.scale = new PIXI.Point(this.shoeScale, this.shoeScale);

            // assets
            this.add(this.sprite, 'shoe-sprite');
        },

        scaleToContainer: function(scale) {
            return this.dscale = this.getScaleToContainer(scale);
        },

        getScaleToContainer: function(scale) {
            return (State.currentViewportHeight / this.originalHeight) * scale;
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // y, x
            this.y = ~~( this.y - (this.y - this.dy) * 0.1);
            this.x = ~~( this.x - (this.x - this.dx) * 0.1);

            // @todo, not sure why this staggers. When comboing this with jquery
            // animate, it works well enough until it gets low.. then it's really
            // jerky
            //
            // Actually I thihnk it's because animating the number with dalpha
            // keeps cutting the amount of time of completing. Ordinarily dalpha
            // is static so we keep reducing by a fixed amount, but eventually with
            // ANimate, the dalpha will be 1, 0.5, 0.25, 0.1, 0.05, etc
            //
            // this.alpha = this.alpha - (this.alpha - this.dalpha) * 0.1;

            // scale scale
            this.setScale( this.scale.x - (this.scale.x - this.dscale) * 0.1 );
        },


        // Data
        // -------------------------------------------------------------------

        export: function() {
            return {
                tx       : this.worldTransform.tx,
                ty       : this.worldTransform.ty,
                x        : this.x,
                y        : this.y,
                resource : this.resource.texture,
                shoeIndex: this.shoeIndex,
                scale    : this.dscale,
                width    : this.width,
                height   : this.height
            };
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Sprite
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Sprite = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'sprite',

        // <PIXI_Sprite>
        sprite: null,

        // <Integer> Original height
        originalHeight: 0,

        // <Integer> Original width
        originalWidth: 0,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // asset
            if (typeof(options.url) == 'string') {
                this.sprite = new PIXI.Sprite.fromImage(options.url);
            }
            else {
                this.sprite = new PIXI.Sprite(options.resource.texture);
            }

            // anchor
            if (options.anchor) {
                this.sprite.anchor.set(options.anchor[0], options.anchor[1]);
            }
            else {
                this.sprite.anchor.set(0.5, 0.5);
            }

            this.bg = new PIXI.Graphics();
            this.bg.beginFill( Math.random() * 0xFFFFFF )
                .drawRect(0, - this.sprite.height, this.sprite.width, this.sprite.height * 2)
                .endFill();

            // stat
            this.originalWidth = this.sprite.width;
            this.originalHeight = this.sprite.height;

            // assets
            //this.add(this.bg, 'bg');
            this.add(this.sprite, 'sprite');

            this.debugMarker();

            // set hit area
            this.hitArea = new PIXI.Rectangle(0, - this.sprite.height, this.sprite.width, this.sprite.height * 2);
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Timeline
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Timeline = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'timeline',

        // <Integer>
        marginTop: 175,

        // <Integer> Color
        color: 0x999999,

        // <Integer> Font Size
        fontSize: 28,

        // <Integer> Width of line
        lineWidth: 3,

        // <Integer> How far out we want the line to go
        lineOut: 15,

        // <Integer> How far up we want the line to go
        lineUp: 15,

        // <Integer> Caption box width
        captionBoxWidth: 380,
        captionBoxHeight: 215,

        // <>
        mask1: null,
        mask2: null,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add arrows
            this.createBox();
            this.createLine();
            this.createMask();
            this.createText();

            // set size
            this.setSize(50);
        },

        createBox: function() {
            this.add(new PIXI.Graphics, 'box');
            this.drawBox(1);

            // hide intiially
            this.get('box').visible = false;
        },

        createLine: function() {
            var wrapper = new namespace.Abstract_PixiLayer,
                line, barLeft, barRight, arrowLeft, arrowRight,
                lo = scaled(this.lineOut),
                lu = scaled(this.lineUp),
                lw = scaled(this.lineWidth);

            line = new PIXI.Graphics;
            line.beginFill(this.color)
                .drawRect(0, - scaled(this.lineWidth / 2) / 2, 5, scaled(this.lineWidth))
                .endFill();

            arrowLeft = new PIXI.Graphics;
            arrowLeft
                .lineStyle(lw, this.color, 1)
                .moveTo(lo, -lu)
                .lineTo(0, 0)
                .lineTo(lo, lu);

            barLeft = new PIXI.Graphics;
            barLeft
                .lineStyle(lw, this.color, 1)
                .moveTo(0, -lu)
                .lineTo(0, 0)
                .lineTo(0, lu);

            arrowRight = new PIXI.Graphics;
            arrowRight
                .lineStyle(lw, this.color, 1)
                .moveTo(-lo, -lu)
                .lineTo(0, 0)
                .lineTo(-lo, lu);

            barRight = new PIXI.Graphics;
            barRight
                .lineStyle(lw, this.color, 1)
                .moveTo(-0, -lu)
                .lineTo(-0, 0)
                .lineTo(-0, lu);

            wrapper.add(arrowLeft,  'arrow-left');
            wrapper.add(arrowRight, 'arrow-right');
            wrapper.add(barLeft,    'bar-left');
            wrapper.add(barRight,   'bar-right');
            wrapper.add(line,       'line');

            arrowLeft.x = 0;
            barLeft.x = 0;

            barLeft.alpha = 0;
            barRight.alpha = 0;

            this.add(wrapper, 'graph');
        },

        createMask: function() {
            var masks, w = State.currentViewportWidth * 2;

            masks = new PIXI.Graphics;

            masks.beginFill(0x0)
                .drawRect(this.captionBoxWidth / 2, -200, w, 400)
                .drawRect(-w, -200, w - (this.captionBoxWidth / 2) , 400)
                .endFill();

            masks.scale.x = masks.scale.y = vpScale();

            this.mask = masks;
            this.add(masks, 'masks');
        },

        createText: function() {
            var wrapper = new namespace.Abstract_PixiLayer,
                mask    = new PIXI.Graphics,
                line,
                year,
                abbrev,
                shoe,
                n;

            // draw mask to hide text excess
            this.drawTextMask();

            // add words
            for (var i = 0, l = Assets.data.shoes.length; i < l; i++) {
                shoe = Assets.data.shoes[i];

                abbrev = wrapper.add(new PIXI.Text( tracking(shoe.abbrev, ' '), {
                    font: scaled(this.fontSize) + 'px "Jordan Druk"',
                    fill: 0x999999,
                    padding: 5
                }), 'abbrev-' + i);

                year = wrapper.add(new PIXI.Text( tracking(shoe.year, ' '), {
                    font: scaled(this.fontSize) + 'px "Jordan Druk"',
                    fill: 0x999999,
                    padding: 5
                }), 'year-' + i);

                abbrev.anchor.set(0, 0.5 - 0.05 - (5 / abbrev.height));
                year.anchor.set(0, 0.5 - 0.05 - (5 / year.height));

                /**
                 * this caused me 3 hours of heartache because these are TEXT
                 * and not PixiLayers. Turn it into a PixiLayer at some point.
                 */
                abbrev.dscale = 1;
                year.dscale = 1;
                abbrev.dx = 0;
                year.dx = 0;
                abbrev.dy = 0;
                year.dy = 0;

            }

            // mask wrapper
            wrapper.mask = mask;
            this.add(wrapper, 'text-wrapper');
            this.add(mask, 'text-mask');
        },

        drawBox: function(scale) {
            scale || (scale = 1);

            var lw = scaled( this.lineWidth ),
                w  = scaled( this.captionBoxWidth * scale ),
                h  = scaled( this.captionBoxHeight * scale );

            this.get('box')
                .clear()
                .lineStyle(lw, this.color)
                .drawRect( - w / 2, - h / 2, w, h)
                .endFill();
        },

        drawTextMask: function() {
            var mask,
                margin = 20;

            if (mask = this.get('text-mask')) {
                mask.clear()
                .beginFill(0xff0000)
                .drawRect( margin, -200, this.getWidth() - margin * 2, 400)
                .endFill();
            }
        },

        setSize: function(width) {
            var line = this.get('graph line'),
                margin = 10;

            line.clear()
                .beginFill(this.color)
                .drawRect(0, - scaled(this.lineWidth) / 2, width, scaled(this.lineWidth))
                .endFill();

            this.get('graph arrow-right').x = width;
            this.get('graph bar-right').x = width;
        },

        animateToSize: function(width) {
            var self = this,
                obj  = {
                    width: this.getWidth()
                };

            // draw
            $(obj).animate({
                width: width
            }, {
                duration: 750  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : "easeOutBackLight"),
                step: function() {
                    self.setSize(obj.width);
                }
            });
        },


        // Getters
        // ------------------------------------------------------------------

        getWidth: function() {
            return this.get('graph arrow-right').x;
        },

        getTextWrapperWidth: function() {
            return this.getTextWidth() * Assets.data.shoes.length;
        },

        getTextWidth: function() {
            return scaled( 75 );
        },


        hideMasks: function() {
            this.mask = null;
            this.get('masks').visible = false;
        },

        showMasks: function() {
            this.get('masks').visible = true;
            this.mask = this.get('masks');
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function(options, callback) {
            this.animationState = 'in';

            this.dalpha = 1;

            this.animateToSize( State.currentViewportWidth - scaled(125 * 2) );
            if (Constants.ANIMATE_BOX){
                this.animateBox(1, 0.5, 250);
            }


            callback && setTimeout(callback, 250);
        },

        animateBox: function(from, to, delay, speed) {
            speed || (speed = 500);
            from  || (from = 1);
            to    || (to = 0.5);

            var self = this;

            this.drawBox(from);
            this.get('box').visible = true;

            return $({ scale: from }).delay(delay).animate({
                scale: to
            }, {
                duration: speed  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInOutQuad'),
                step: function(scale) {
                    self.drawBox(scale);
                }
            });
        },

        animateOut: function(options, callback) {
            var self = this;

            this.animationState = 'out';

            // animate box
            if (Constants.ANIMATE_BOX){
                this.animateBox(0.5, 1, 0, 250);
            }

            setTimeout(function( scope ) {
                scope.animateToSize(50);
            }, 250, this);


            setTimeout(function( scope ) {
                scope.dalpha = 0;
                scope.showMasks();

                callback && callback();
            }, 400, this);
        },

        toggleAnimatedState: function() {
            if (this.animationState == 'in') {
                this.animateOut();
            }
            else {
                this.animateIn();
            }
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            var box, masks, tw;

            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            box   = this.get('box');
            tw    = this.get('text-wrapper');
            masks = this.get('masks');

            // position
            this.x     = State.currentViewportWidth / 2 - this.getWidth() / 2;
            this.y     = scaled(this.marginTop + this.captionBoxHeight / 2);
            this.alpha = this.alpha - (this.alpha - this.dalpha) * 0.1;

            // position main wrapper
            tw.x  = tw.x - (tw.x - tw.dx) * 0.1;
            box.x = ~~(this.getWidth() / 2);

            // mask positon
            if (masks) {
                masks.x = this.getWidth() / 2;
            }

            // cycle through all numbers
            for (var i = 0, l = Assets.data.shoes.length; i < l; i++) {
                var abbrev, year;

                abbrev = this.get('text-wrapper abbrev-' + i);
                year   = this.get('text-wrapper year-' + i);

                abbrev.x = rt(abbrev.x - (abbrev.x - abbrev.dx) * 0.1);
                abbrev.y = -0;

                abbrev.y = - scaled(25);
                abbrev.scale.x = abbrev.scale.y = ( abbrev.scale.x - (abbrev.scale.x - abbrev.dscale) * 0.1 );

                year.x   = rt(year.x - (year.x - year.dx) * 0.1);
                year.y   = scaled(20);
                year.scale.x = year.scale.y = ( year.scale.x - (year.scale.x - year.dscale) * 0.1 );
            }

            // draw text mask
            this.drawTextMask();
        },

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            var estimatedLock = Math.round ((Assets.data.shoes.length - 1) * State.carouselRatioX),
                lastX = 0,
                tw = this.getTextWidth();

            // cycle through all numbers
            for (var i = 0, l = Assets.data.shoes.length; i < l; i++) {
                var abbrev, year, aw, yw;

                abbrev = this.get('text-wrapper abbrev-' + i);
                year = this.get('text-wrapper year-' + i);

                abbrev.dscale = year.dscale = 0.65;

                lastX = i * tw;

                if (i > estimatedLock) {
                    lastX += tw;
                }
                else if (i < estimatedLock) {
                    lastX -= tw;
                }
                else {
                    abbrev.dscale = year.dscale = 1;
                }

                abbrev.dx = lastX - abbrev.width / 2;
                year.dx   = lastX - year.width / 2;
            }

            // position timeline
            this.get('text-wrapper').dx = (this.getWidth() / 2) - (this.getTextWrapperWidth() - this.getTextWidth()) * State.carouselRatioX;

            // arrow left
            if (this.get('text-wrapper').dx > this.getTextWidth()) {
                this.get('graph arrow-left').alpha = 0;
                this.get('graph bar-left').alpha = 1;
            }
            else {
                this.get('graph arrow-left').alpha = 1;
                this.get('graph bar-left').alpha = 0;
            }

            // arrow right
            if (this.getTextWrapperWidth() + this.get('text-wrapper').dx < this.getWidth()) {
                this.get('graph arrow-right').alpha = 0;
                this.get('graph bar-right').alpha = 1;
            }
            else {
                this.get('graph arrow-right').alpha = 1;
                this.get('graph bar-right').alpha = 0;
            }
        }


    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Paragraph
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_TouchToBegin = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'touch to begin',

        // <PIXI_Text> Description text
        text: null,

        // <Integer>
        fontSize: 23,

        // <String> Kerning doesn't exist in canvas
        // this is as close as it's going to get (2x spaces)
        caption: null, //MH - added in extra spaces to create visual separation in "TOUCH SCREEN"


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // create text
            switch (Constants.LANGUAGE){
                case 'CNT':
                    this.text = PIXI.Sprite.fromImage( Constants.IMAGE_HOST + '/chinese/touch-to-begin-traditional.png');

                    // size
                    this.text.width = 300;
                    this.text.height = 30;
                    this.text.anchor.set(0.5, 0);
                    break;
                case 'CNS':
                    this.text = PIXI.Sprite.fromImage( Constants.IMAGE_HOST + '/chinese/touch-to-begin-simplified.png');

                    // size
                    this.text.width = 256;
                    this.text.height = 30;
                    this.text.anchor.set(0.5, 0);
                    break;
                default:
                    this.caption = 'TOUCH   SCREEN TO BEGIN'.replace(/(.)(?=.)/g, '$1');
                    this.text = new PIXI.Text(this.caption, {
                        font      : scaled(this.fontSize) + 'px "Jordan NHG Disp 55 Roman"',
                        fill      : Colors.HEX_BLACK,
                        padding   : 5
                    });
                    this.text.anchor.set(0.5, 0);
                    break;
            }



            // create bg
            this.bg = new PIXI.Graphics;
            this.bg.lineStyle(scaled(5), Colors.BLACK, 1)
                // .beginFill(Colors.WHITE)
                .drawRect(-45, -2.5 - 20, this.text.width + (45 * 2), this.text.height + (20 * 2) - (5 * 2))
                .endFill();

            this.bg.x = - this.text.width / 2;

            // position


            // mask2
            this.mask = new PIXI.Graphics;
            this.mask.beginFill(Colors.WHITE)
                .drawRect( -75, -25, this.text.width + (75 * 2), this.text.height + (20 * 2) - (5) )
                .endFill();

            // this.mask.alpha = 0.5;
            this.mask.x = - this.text.width / 2;

            // add to stage
            this.add(this.bg);
            this.add(this.text);
            this.add(this.mask);

            // hide bg
            this.bg.visible = false;
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // position
            this.x     = this.dx;
            this.y     = this.dy;
        },

        update: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // pos
            this.dx = State.currentViewportWidth / 2;
            this.dy = State.currentViewportHeight / 16 * 7;
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            console.color("[ttb] Animating in", Colors.ANIMATION);

            $(this).animate({
                alpha: 1
            }, {
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInQuad')
            });
        },

        animateOut: function() {
            console.color("[ttb] Animating Out", Colors.ANIMATION);

            $(this).animate({
                alpha: 0
            }, {
                duration: 500  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInQuad')
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Carousel_Numeral
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Carousel_Numeral = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'carousel numeral',

        // <PIXI_Sprite>
        number: null,
        shadow: null,

        // <Integer> Original height
        originalHeight: 0,

        // <Integer> Original width
        originalWidth: 0,

        // <Float>
        scaleY: 0.54,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // asset
            this.number = new PIXI.Sprite(options.number.texture);
            if (Constants.SHADOWS){
                this.shadow = new PIXI.Sprite(options.shadow.texture);
                this.shadow.scale = new PIXI.Point(1, 1);
                this.add(this.shadow, 'shadow', null, 'suppressLog');
            }


            // stat
            this.originalWidth = this.number.width;
            this.originalHeight = this.number.height;

            // scale down
            this.number.scale = new PIXI.Point(1, 1);


            // DO NOT ANCHOR. Our images are equal from TL, not Bottom Middle.
            // If we anchor this way, they wont line up properly.
            // anchor
            // this.number.anchor.set(0.0, 1.05);
            // this.shadow.anchor.set(0.0, 1.00);

            // assets
            this.add(this.number, 'number', null, 'suppressLog');


            // cache
            // this.cacheAsBitmap = true;
        },


        // Display
        // -------------------------------------------------------------------

        update: function() {
            var scale = (State.currentViewportHeight * this.scaleY) / this.originalHeight;

            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // position
            this.number.x     = (State.currentViewportWidth / 2) - (this.number.width / 2);
            this.number.scale = new PIXI.Point( scale, scale );
            if (Constants.SHADOWS){
                this.shadow.x     = (State.currentViewportWidth / 2) - (this.shadow.width / 2);
                this.shadow.scale = new PIXI.Point( scale, scale );
            }

            if (Constants.SHADOWS){
                this.number.y = this.shadow.y = - this.number.height;
            } else {
                this.number.y = - this.number.height;
            }


            // make sure we don't go over the width
            // if (this.number.width > State.currentViewportWidth) {
            //     scale = (State.currentViewportWidth * 1.10) / this.originalWidth;

            //     this.number.scale = new PIXI.Point( scale, scale );
            //     this.shadow.scale = new PIXI.Point( scale, scale );
            // }
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Carousel_Shoe
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Carousel_Shoe = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'carousel shoe',

        // <PIXI_Sprite>
        sprite: null,

        // <Float> Scale
        shoeScale: 0.86,

        censorHeight: scaled(300),


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // asset
            // this.sprite = new PIXI.Sprite(options.resource.texture);
            this.shoe           = new namespace.PixiLayer_Shoe(options);
            this.censor         = new PIXI.Graphics;
            // this.censor.visible = false;
            this.censor.alpha   = 0;

            // anchor
            this.shoe.sprite.anchor.set(0, 1);

            // assets
            this.add(this.shoe, 'shoe-sprite', 0, 'suppressLog');
            this.add(this.censor, 'censor', 1, 'suppressLog');
        },

        drawCensor: function() {
            var w = scaled(this.shoe.width),
                h = this.censorHeight;

            this.censor.beginFill(0x000000)
                 .drawRect(0, 0, w, h)
                 .endFill();

            this.censor.rotation      = -15 * Constants.DEG_TO_RAD;
            this.censor.cacheAsBitmap = true;
        },

        isCensored: function() {
            return this.censor.alpha >= 1;
        },

        showCensor: function() {
            $(this.censor).stop().animate({
                alpha: 1
            }, 500);
        },

        hideCensor: function() {
            $(this.censor).stop().animate({
                alpha: 0
            }, 500);
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // draw
            this.drawCensor();

            //
            this.censor.x = this.shoe.x;
            this.censor.y = this.shoe.y - this.censorHeight;

            return this;
        },

        update: function() {
            var scale = vpScale() * this.shoeScale;

            // super
            namespace.Abstract_PixiLayer.prototype.update.call(this);

            // position
            this.shoe.dx = (State.currentViewportWidth / 2) - (this.shoe.width / 2);

            // scale
            this.shoe.dscale = scale;
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Grid_Shoe
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Grid_Numeral = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'grid numeral',

        // <PixiLayer_Shoe>
        shoe: null,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            var shoe;

            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // shoe
            shoe = Assets.data.shoes[options.index];

            // asset
            this.bg = new PIXI.Graphics();
            this.bg.beginFill( Math.random() * 0xFFFFFF )
                .drawRect(0, 0, 200, 200)
                .endFill();

            this.shoe = new namespace.PixiLayer_Shoe({
                resource: Assets.getShoeThumbResource(options.index)
            });

            this.shoe.sprite.anchor.set(0.5, 1.0);
            this.bg.alpha = Flags.isDebug ? 0.3 : 0.0;

            // assets
            this.add(this.bg,       'bg',        null, 'suppressLog');
            this.add(this.shoe,     'shoe',      null, 'suppressLog');
        },

        setSize: function(width, height) {
            var availHeight;

            // bg
            this.bg.width = width;
            this.bg.height = height;

            // h
            availHeight = height - this.shoeName.y;

            // the 0.75 allows for margin
            this.shoe.scale.x = this.shoe.scale.y = this.shoe.dscale = Math.min(
                (width * 0.75) / this.shoe.width,
                (availHeight * 0.50) / this.shoe.height
            ) * 0.90;
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            var self = this;

            $({ a: 0 }).animate({ a: 1 }, {

                duration: 750  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInOutQuad'),
                step: function(value) {
                    self.shoe.alpha     = value;
                    self.shoeName.alpha = value;
                    self.shoeYear.alpha = value;
                }

            });
        },

        animateOut: function() {
            var self = this;

            $({ a: 1 }).animate({ a: 0 }, {

                duration: 1000  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInOutQuad'),
                step: function(value) {
                    self.shoe.alpha     = value;
                    self.shoeName.alpha = value;
                    self.shoeYear.alpha = value;
                }

            });
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // y, x
            this.y     = ~~( this.y - (this.y - this.dy) * 0.1);
            this.x     = ~~( this.x - (this.x - this.dx) * 0.1);
            this.alpha = this.alpha - (this.alpha - this.dalpha) * 0.1;

            // scale scale
            this.setScale( this.scale.x - (this.scale.x - this.dscale) * 0.1 );

            // pos
            this.shoe.x = this.bg.width / 2;
            this.shoe.y = 0;
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_Grid_Shoe
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_Grid_Shoe = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'grid shoe',

        // <PixiLayer_Shoe>
        shoe: null,

        // <Integer> Size of font
        fontSize: 12,

        // <Integer> Height of each line in pixels
        lineHeight: 30,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            var shoe;

            options || (options = {});

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // shoe
            shoe = Assets.data.shoes[options.index];

            // asset
            this.bg = new PIXI.Graphics();
            this.bg.beginFill( Math.random() * 0xFFFFFF )
                .drawRect(0, 0, 200, 200)
                .endFill();

            this.shoe = new namespace.PixiLayer_Shoe({
                resource: Assets.getShoeThumbResource(options.index)
            });

            this.shoeName = new PIXI.Text(shoe.name.toUpperCase(), {
                font: scaled(this.fontSize) + 'px "Jordan NHG Disp 75"',
                fill: shoe.championship ? Colors.GOLD : Colors.BLACK
            });

            this.shoeYear = new PIXI.Text(shoe.year, {
                font: scaled(this.fontSize) + 'px "Jordan NHG Disp 55 Roman"',
                fill: shoe.championship ? Colors.GOLD : Colors.BLACK
            });

            this.shoe.sprite.anchor.set(0.5, 1.0);
            this.shoeName.alpha = 0.0;
            this.shoeYear.alpha = 0.0;
            this.bg.alpha = Flags.isDebug ? 0.3 : 0.0;

            // text anchor
            this.shoeName.anchor = new PIXI.Point(0.5, 0.5);
            this.shoeYear.anchor = new PIXI.Point(0.5, 0.5);

            // assets
            this.add(this.bg,       'bg',        null, 'suppressLog');
            this.add(this.shoe,     'shoe',      null, 'suppressLog');
            this.add(this.shoeName, 'shoe-name', null, 'suppressLog');
            this.add(this.shoeYear, 'shoe-year', null, 'suppressLog');
        },

        setSize: function(width, height) {
            var availHeight;

            // bg
            this.bg.width = width;
            this.bg.height = height;

            // h
            availHeight = height - this.shoeName.y;

            // the 0.75 allows for margin
            this.shoe.scale.x = this.shoe.scale.y = this.shoe.dscale = Math.min(
                (width * 0.75) / this.shoe.width,
                (availHeight * 0.50) / this.shoe.height
            ) * 0.90;
        },

        setInteractive: function() {
            this.interactive = true;
            this.hitArea = new PIXI.Rectangle(0, 0, this.bg.width, this.bg.height);
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            var self = this;

            // $({ a: 0 }).delay(250).animate({ a: 1 }, {
            $({ a: 0 }).animate({ a: 1 }, {

                duration: 750  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInOutQuad'),
                step: function(value) {
                    self.shoe.alpha     = value;
                    self.shoeName.alpha = value;
                    self.shoeYear.alpha = value;
                }

            });
        },

        animateOut: function() {
            var self = this;

            $({ a: 1 }).animate({ a: 0 }, {

                duration: 1000  * Constants.DO_ANIMATE,
                easing: (Constants.SINGLE_EASE ? Constants.EASE : 'easeInOutQuad'),
                step: function(value) {
                    self.shoe.alpha     = value;
                    self.shoeName.alpha = value;
                    self.shoeYear.alpha = value;
                }

            });
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // y, x
            this.y     = ~~( this.y - (this.y - this.dy) * 0.1);
            this.x     = ~~( this.x - (this.x - this.dx) * 0.1);
            this.alpha = this.alpha - (this.alpha - this.dalpha) * 0.1;

            // scale scale
            this.setScale( this.scale.x - (this.scale.x - this.dscale) * 0.1 );

            // pos
            this.shoeName.x = this.bg.width / 2;
            this.shoeYear.x = this.bg.width / 2;

            this.shoeYear.y = this.bg.height - this.shoeYear.height;
            this.shoeName.y = this.bg.height - this.shoeYear.height - this.shoeName.height;

            // font size
            this.shoeName.style.font       = scaled(this.fontSize) + 'px "Jordan NHG Disp 55 Roman"';
            this.shoeName.style.lineHeight = scaled(this.lineHeight);

            this.shoeYear.style.font       = scaled(this.fontSize) + 'px "Jordan NHG Disp 55 Roman"';
            this.shoeYear.style.lineHeight = scaled(this.lineHeight);

            this.shoe.x = this.bg.width / 2;
            this.shoe.y = this.shoeName.y - this.shoeName.height;
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * PixiLayer_CaptionBoxText
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        State      = namespace.State,
        Flags      = namespace.Flags
    ;

    namespace.PixiLayer_CaptionBox_Text = namespace.Abstract_PixiLayer.extend({

        // <String> Name of class
        name: 'caption box text',

        // <PIXI_Text> Text that is currently up
        captionOld: null,

        // <PIXI_Text> Text that is coming up
        captionNew: null,

        // <Integer> This prevents some fonts from being cut off on top / bottom
        padding: 5,

        // <Integer> Overridden by Caption-box
        fontSize: 40,


        // Public Methods
        // ------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // bindings
            _.bindAll(this, 'onResize');

            // super
            namespace.Abstract_PixiLayer.prototype.initialize.call(this, options);

            // add logo
            this.captionOld = new PIXI.Text(' ', {
                font   : scaled(this.fontSize) + 'px "Jordan Druk"',
                fill   : Colors.GOLD,
                resolution: 2,
                padding: this.padding
            });

            this.captionNew = new PIXI.Text(' ', {
                font   : scaled(this.fontSize) + 'px "Jordan Druk"',
                fill   : Colors.BLACK,
                resolution: 2,
                padding: this.padding
            });

            // add
            this.add(this.captionOld);
            this.add(this.captionNew);

            // anchors
            this.captionOld.anchor.set(0.5, 0.5);
            this.captionNew.anchor.set(0.5, 0.5 - 0.05 - (5 / this.captionNew.height));

            // mask
            this.createMask();

            // set
            this.setBlack();
        },

        attachEvents: function() {
            namespace.on(Events.RESIZE, this.onResize);
        },

        detachEvents: function() {
            namespace.off(Events.RESIZE, this.onResize);
        },

        createMask: function() {
            var mask = new PIXI.Graphics,
                x = scaled(-200),
                y = scaled(-50),
                w = scaled(400),
                h = scaled(100);

            mask.beginFill(0xffff00)
                .drawRect(x, y, w, h)
                .endFill();

            this.mask = mask;
            this.add(mask);
        },

        setBlack: function() {
            this.captionOld.style.fill = Colors.HEX_BLACK;
            this.captionNew.style.fill = Colors.HEX_BLACK;
        },

        setGold: function() {
            this.captionOld.style.fill = Colors.HEX_GOLD;
            this.captionNew.style.fill = Colors.HEX_GOLD;
        },

        animateToTextDown: function(caption) {
            this.captionOld.text = this.captionNew.text;
            this.captionOld.y    = this.captionNew.y;
            this.captionOld.dy   = scaled(110);

            this.captionNew.y    = scaled(-110);
            this.captionNew.dy   = 0;
            this.captionNew.text = tracking(caption, ' ');
        },

        animateToTextUp: function(caption) {
            this.captionOld.text = this.captionNew.text;
            this.captionOld.y    = this.captionNew.y;
            this.captionOld.dy   = scaled(-110);

            this.captionNew.y    = scaled(110);
            this.captionNew.dy   = 0;
            this.captionNew.text = tracking(caption, ' ');
        },


        // Display
        // -------------------------------------------------------------------

        render: function() {
            // super
            namespace.Abstract_PixiLayer.prototype.render.call(this);

            // position of inner text
            this.captionOld.y = ~~( this.captionOld.y - (this.captionOld.y - this.captionOld.dy) * 0.1);
            this.captionNew.y = ~~( this.captionNew.y - (this.captionNew.y - this.captionNew.dy) * 0.1);
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onResize: function() {
            this.captionOld.style.font = scaled(this.fontSize) + 'px "Jordan Druk"';
            this.captionNew.style.font = scaled(this.fontSize) + 'px "Jordan Druk"';
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * Scene_Grid
 *
 * Looping grid that waits for us to go into the main carousel
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        Flags      = namespace.Flags,
        State      = namespace.State
    ;


    namespace.Scene_Grid = namespace.Abstract_Scene.extend({

        // <String> Name of class
        name: 'grid',


        // Public Methods
        // -------------------------------------------------------------------

        setup: function() {
            // bindings
            _.bindAll(this, 'onGridAnimateOut');

            // elements
            if (Constants.BG){
                this.add(new namespace.PixiLayer_Background({
                    type: "-home"
                }), 'background');
            }

            this.add(new namespace.PixiLayer_Grid, 'grid');

            // events
            this.get('grid').on(Events.ANIMATE_OUT, this.onGridAnimateOut);
        },

        attachEvents: function() {
            this.get('grid').attachEvents();
        },

        detachEvents: function() {
            this.get('grid').detachEvents();
        },


        // Animation
        // ------------------------------------------------------------------

        animateIn: function() {
            this.get('grid').animateIn();
            // this.get('background').animateIn();
        },

        animateOut: function(callback) {
            this.get('grid').animateOut(-1, false);
            // this.get('background').animateOut();

            callback && setTimeout(callback, 750);
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onGridAnimateOut: function() {
            namespace.trigger(Events.SCENE_CHANGE, {
                scene: 'main'
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * Scene_Intro
 *
 * Looping intro that waits for us to go into the main carousel
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        Flags      = namespace.Flags,
        State      = namespace.State
    ;


    namespace.Scene_Intro = namespace.Abstract_Scene.extend({

        // <String> Name of class
        name: 'intro',


        // Public Methods
        // -------------------------------------------------------------------

        setup: function() {
            // bindings
            _.bindAll(this, 'onAttractLoopAnimateOut');

            // elements
            if (Constants.BG){
                this.add(new namespace.PixiLayer_Background({
                    type: "-home"
                }), 'background');
            }

            this.add(new namespace.PixiLayer_AttractLoop, 'attract-loop');

            // events
            this.get('attract-loop').on(Events.ANIMATE_OUT, this.onAttractLoopAnimateOut);
        },

        attachEvents: function() {
            this.get('attract-loop').attachEvents();
        },

        detachEvents: function() {
            this.get('attract-loop').detachEvents();
        },


        // Animation
        // ------------------------------------------------------------------

        animateIn: function() {
            this.get('attract-loop').animateIn();
            // this.get('background').animateIn();
        },

        animateOut: function() {
            this.get('attract-loop').animateOut();
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onAttractLoopAnimateOut: function() {
            namespace.trigger(Events.SCENE_CHANGE, {
                scene: 'grid'
            });
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * Scene_Main
 *
 * The manager for the main view that allows for swiping, roman
 * numerals, timeline, etc. If it were a website, it would be called Page_Main
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        Flags      = namespace.Flags,
        State      = namespace.State
    ;

    namespace.Scene_Main = namespace.Abstract_Scene.extend({

        // <String> Name of class
        name: "main",

        // <Integer> Delay of animation start
        animationDelay: 250,


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {
            options || (options = {});

            // bindings
            _.bindAll(this, 'onClickCaptionBox', 'onClickGridIcon', 'onLockShoe');

            // log
            console.color("[Scene] Welcome to Main!", Colors.SCENE);

            // super
            namespace.Abstract_Scene.prototype.initialize.call(this, options);
        },

        setup: function() {
            if (Constants.BG){
                this.add(new namespace.PixiLayer_Background({
                    type: '-home'
                }), 'background-under');
                this.add(new namespace.PixiLayer_Background,         'background');
            }


            this.add(new namespace.PixiLayer_RomanNumeralsImage, 'roman-numerals');
            // this.add(new namespace.PixiLayer_Timeline,           'timeline');
            this.add(new namespace.PixiLayer_CaptionBox,         'caption-box');
            this.add(new namespace.PixiLayer_Carousel,           'carousel');
            this.add(new namespace.PixiLayer_Jumpman,            'jumpman');
            this.add(new namespace.PixiLayer_Paragraph,          'paragraph');
            this.add(new namespace.PixiLayer_GridIcon,           'grid-icon');

            if (Constants.LANGUAGE == "CNT" || Constants.LANGUAGE == 'CNS'){ //add the text "menu" for chinese version
                this.add(new namespace.PixiLayer_MenuText,           'menu-text');
            }

        },

        attachEvents: function() {
            this.get('roman-numerals').attachEvents();
            // this.get('timeline').attachEvents();
            this.get('caption-box').attachEvents();
            this.get('carousel').attachEvents();
            this.get('jumpman').attachEvents();
            this.get('paragraph').attachEvents();
            this.get('grid-icon').attachEvents();

            // interactivity
            this.get('caption-box').setInteractive();

            // events
            this.get('carousel').on(Events.LOCK_SHOE, this.onLockShoe);
            this.get('grid-icon').on(Events.CLICK_LAYER, this.onClickGridIcon);
            this.get('caption-box').on(Events.CLICK_LAYER, this.onClickCaptionBox);
        },

        detachEvents: function() {
            this.get('roman-numerals').detachEvents();
            // this.get('timeline').detachEvents();
            this.get('caption-box').detachEvents();
            this.get('carousel').detachEvents();
            this.get('jumpman').detachEvents();
            this.get('paragraph').detachEvents();
            this.get('grid-icon').detachEvents();

            // events
            this.get('carousel').off(Events.LOCK_SHOE, this.onLockShoe);
            this.get('grid-icon').off(Events.CLICK_LAYER, this.onClickGridIcon);
            this.get('caption-box').off(Events.CLICK_LAYER, this.onClickCaptionBox);
        },


        // Animation
        // -------------------------------------------------------------------

        animateIn: function() {
            this.get('grid-icon').animateIn();
            if (Constants.BG){
                this.get('background').animateIn();
            }
            // this.get('jumpman').setNone();

            setTimeout(function(scope) {

                scope.get('caption-box').animateIn(null, function() {
                    // scope.get('caption-box').interactive = false;
                });

            }, this.animationDelay, this);


            setTimeout(function(scope) {
                scope.get('carousel').animateIn();
                scope.get('roman-numerals').animateIn();

                // scope.get('timeline').animateIn();
                scope.get('carousel').goTo( State.selectedGridItem || 0, true );
                scope.get('roman-numerals').goTo( State.selectedGridItem || 0, true );

            }, this.animationDelay + 250, this);


            setTimeout(function(scope) {
                scope.get('paragraph').animateIn();
                scope.get('jumpman').animateIn();

                scope.onLockShoe( State.selectedGridItem || 0, null, true );

            }, this.animationDelay + 750, this);


            // setTimeout(function(scope) {
            //     scope.get('timeline').animateOut(null, function() {
            //         scope.get('caption-box').interactive = true;
            //     });
            // }, this.animationDelay + 3500, this);
        },

        animateOut: function(callback) {
            if (Constants.BG){
                this.get('background').animateOut();
            }

            setTimeout(function(scope) {
                scope.get('grid-icon').animateOut();
                scope.get('paragraph').animateOut();
                scope.get('jumpman').animateOut();
                scope.get('menu-text').animateOut();
            }, 1, this);


            setTimeout(function(scope) {
                scope.get('carousel').animateOut();
                scope.get('roman-numerals').animateOut();
                // scope.get('timeline').animateOut();
                scope.get('caption-box').animateOut();
                scope.get('menu-text').animateOut();
            }, 500, this);

            callback && setTimeout(callback, 1500);
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onClickCaptionBox: function(e) {
            // var timeline = this.get('timeline'),
            //     cb       = this.get('caption-box');

            // if (timeline.animationState == 'in') {
            //     timeline.animateOut();

            //     setTimeout(function(scope) {
            //         cb.animateIn();
            //         cb.animateArrowsIn();

            //         scope.onLockShoe(State.lastLockedIndex);
            //     }, 300, this);
            // }
            // else if (cb.interactive == true) {
            //     cb.animateOut({
            //         duration: 100
            //     });

            //     timeline.hideMasks();
            //     timeline.animateIn();
            // }
            // else {
            //     console.warn("Nothing to click yet.");
            // }
        },

        onClickGridIcon: function(e) {
            this.animateOut();

            this.detachEvents();

            setTimeout(function() {
                namespace.trigger(Events.SCENE_CHANGE, {
                    scene: 'grid'
                });
            }, 1500);
        },

        onLockShoe: function(index, direction, stopCaptions) {
            State.direction = direction;
            var shoeData = Assets.data.shoes[index];

            if (shoeData.championship) {
                this.get('jumpman').setGold();
                this.get('paragraph').setGold();
                this.get('caption-box').setGold();
            }
            else {
                this.get('jumpman').setBlack();
                this.get('paragraph').setBlack();
                this.get('caption-box').setBlack();
            }

            // set caption
            if ((!stopCaptions && index > 0) || index == 0) {
                this.get('caption-box').setCaptions(shoeData.name, shoeData.year, direction > 0 ? 'Down' : 'Up');
                if (Constants.ANIMATE_BOX){
                    this.get('caption-box').animateBox();
                }
            }

            // set pgraph
            this.get('paragraph').setText(shoeData.description);
        }

    });

}) (window.pm || (window.pm = {}));


/**
 * Input_Mouse
 *
 * This class is a standalone input detector.
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        Flags      = namespace.Flags,
        State      = namespace.State,
        URLParams  = namespace.URLParams
    ;

    namespace.Input_Mouse = {

        // <Integer> Time of last event in ms to throttle the sample rate
        lastEvent: 0,

        // <Interval> Timeouts for idle
        timeout1: null,
        timeout2: null,
        timeout3: null,


        // Public Methods
        // -------------------------------------------------------------------

        enable: function() {
            namespace.on(Events.SCENE_UPDATE, this.onSceneUpdate);

            console.color("[mouse] Enabled", Colors.MOUSE);

            $(document).on('mousedown', this.onMouseDown);
            $(document).on('mousemove', this.onMouseMove);
            $(document).on('mouseup', this.onMouseUp);
        },

        disable: function() {
            namespace.off(Events.SCENE_UPDATE, this.onSceneUpdate);

            console.color("[mouse] Disabled", Colors.MOUSE);

            $(document).off('mousedown', this.onMouseDown);
            $(document).off('mousemove', this.onMouseMove);
            $(document).off('mouseup', this.onMouseUp);
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onSceneUpdate: function() { //MH - carousel inertia reduced here (with easing)
            State.mouse.inertiaX = ~~ (State.mouse.inertiaX / 1.1);
            State.mouse.inertiaY = ~~ (State.mouse.inertiaY / 1.1);
        },

        onMouseDown: function(e) {
            console.color("[mouse] Down", Colors.MOUSE);

            State.mouse.x = State.mouse.endX = State.mouse.startX = e.pageX;
            State.mouse.y = State.mouse.endY = State.mouse.startY = e.pageY;

            State.mouse.down = true;

            // clear timeouts
            clearTimeout(namespace.Input_Mouse.timeout1);
            clearTimeout(namespace.Input_Mouse.timeout2);
            clearTimeout(namespace.Input_Mouse.timeout3);
        },

        onMouseUp: function(e) {
            console.color("[mouse] Up", Colors.MOUSE);

            State.mouse.endX = e.pageX;
            State.mouse.endY = e.pageY;

            State.mouse.down = false;

            clearTimeout(namespace.Input_Touch.timeout1);
            clearTimeout(namespace.Input_Touch.timeout2);
            clearTimeout(namespace.Input_Touch.timeout3);

            namespace.Input_Touch.timeout1 = null;
            namespace.Input_Touch.timeout2 = null;
            namespace.Input_Touch.timeout3 = null;

            namespace.Input_Mouse.timeout1 = setTimeout(function() {
                namespace.trigger(Events.MOUSE_IDLE, 1);
            }, Constants.MOUSE_IDLE_INTERVAL1);

            namespace.Input_Mouse.timeout2 = setTimeout(function() {
                namespace.trigger(Events.MOUSE_IDLE, 2);
            }, Constants.MOUSE_IDLE_INTERVAL2);

            namespace.Input_Mouse.timeout3 = setTimeout(function() {
                namespace.trigger(Events.MOUSE_IDLE, 3);
            }, Constants.MOUSE_IDLE_INTERVAL3);
        },

        onMouseMove: function(e) {
            var pageX       = e.pageX,
                pageY       = e.pageY,
                sensitivity = Constants.TOUCH_SENSITIVITY,
                time        = Date.now();

            // throttle sample rate
            if (time < this.lastEvent + Constants.MIN_MOUSE_SAMPLE_RATE) {
                return false;
            }

            // only records movements on mouse down
            if (!State.mouse.down) {
                return false;
            }

            this.lastEvent = time;

            State.mouse.diffX  = (pageX - State.mouse.x) * sensitivity;
            State.mouse.diffY  = (pageY - State.mouse.y) * sensitivity;
            State.mouse.x      = pageX;
            State.mouse.y      = pageY;
            State.mouse.ratioX = ~~ (State.mouse.x / State.currentViewportWidth * 1000) / 1000;
            State.mouse.ratioY = ~~ (State.mouse.y / State.currentViewportHeight * 1000) / 1000;

            if (State.mouse.diffX < 0) {
                State.mouse.inertiaX = ~~ Math.min(State.mouse.diffX, State.mouse.inertiaX);
                State.mouse.inertiaY = ~~ Math.min(State.mouse.diffY, State.mouse.inertiaY);
            }
            else {
                State.mouse.inertiaX = ~~ Math.max(State.mouse.diffX, State.mouse.inertiaX);
                State.mouse.inertiaY = ~~ Math.max(State.mouse.diffY, State.mouse.inertiaY);
            }
        }

    };

})(window.pm || (window.pm = {}));


/**
 * Input_Touch
 *
 * This class is a standalone input detector.
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        Flags      = namespace.Flags,
        State      = namespace.State,
        URLParams  = namespace.URLParams
    ;

    namespace.Input_Touch = {

        // <Integer> Time of last event in ms to throttle the sample rate
        lastEvent: 0,

        // <Interval> Timeouts for idle
        timeout1: null,
        timeout2: null,
        timeout3: null,


        // Public Methods
        // -------------------------------------------------------------------

        enable: function() {
            namespace.on(Events.SCENE_UPDATE, this.onSceneUpdate);

            console.color("[touch] Enabled", Colors.MOUSE);

            $(document).on('touchstart', this.onMouseDown);
            $(document).on('touchmove', this.onMouseMove);
            $(document).on('touchend', this.onMouseUp);
        },

        disable: function() {
            namespace.off(Events.SCENE_UPDATE, this.onSceneUpdate);

            console.color("[touch] Disabled", Colors.MOUSE);

            $(document).off('touchstart', this.onMouseDown);
            $(document).off('touchmove', this.onMouseMove);
            $(document).off('touchend', this.onMouseUp);
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onSceneUpdate: function() {
            State.mouse.inertiaX = ~~ (State.mouse.inertiaX / 1.1);
            State.mouse.inertiaY = ~~ (State.mouse.inertiaY / 1.1);
        },

        onMouseDown: function(e) {
            var pageX = e.originalEvent.touches[0].pageX,
                pageY = e.originalEvent.touches[0].pageY;

            console.color("[touch] Down", Colors.MOUSE);

            State.mouse.x = State.mouse.endX = State.mouse.startX = pageX;
            State.mouse.y = State.mouse.endY = State.mouse.startY = pageY;

            State.mouse.down = true;

            // clear timeouts
            clearTimeout(namespace.Input_Touch.timeout1);
            clearTimeout(namespace.Input_Touch.timeout2);
            clearTimeout(namespace.Input_Touch.timeout3);
        },

        onMouseUp: function(e) {
            var pageX = e.originalEvent.changedTouches[0].pageX,
                pageY = e.originalEvent.changedTouches[0].pageY;

            console.color("[touch] Up", Colors.MOUSE);

            State.mouse.endX = pageX;
            State.mouse.endY = pageY;

            State.mouse.down = false;

            clearTimeout(namespace.Input_Touch.timeout1);
            clearTimeout(namespace.Input_Touch.timeout2);
            clearTimeout(namespace.Input_Touch.timeout3);

            namespace.Input_Touch.timeout1 = null;
            namespace.Input_Touch.timeout2 = null;
            namespace.Input_Touch.timeout3 = null;

            namespace.Input_Touch.timeout1 = setTimeout(function() {
                namespace.trigger(Events.MOUSE_IDLE, 1);
            }, Constants.MOUSE_IDLE_INTERVAL1);

            namespace.Input_Touch.timeout2 = setTimeout(function() {
                namespace.trigger(Events.MOUSE_IDLE, 2);
            }, Constants.MOUSE_IDLE_INTERVAL2);

            namespace.Input_Touch.timeout3 = setTimeout(function() {
                namespace.trigger(Events.MOUSE_IDLE, 3);
            }, Constants.MOUSE_IDLE_INTERVAL3);
        },

        onMouseMove: function(e) {
            var pageX       = e.originalEvent.touches[0].pageX,
                pageY       = e.originalEvent.touches[0].pageY,
                sensitivity = Constants.TOUCH_SENSITIVITY,
                time        = Date.now();

            // throttle sample rate
            if (time < this.lastEvent + Constants.MIN_MOUSE_SAMPLE_RATE) {
                return false;
            }

            // only records movements on mouse down
            if (!State.mouse.down) {
                return false;
            }

            this.lastEvent = time;

            State.mouse.diffX  = (pageX - State.mouse.x) * sensitivity;
            State.mouse.diffY  = (pageY - State.mouse.y) * sensitivity;
            State.mouse.x      = pageX;
            State.mouse.y      = pageY;
            State.mouse.ratioX = ~~ (State.mouse.x / State.currentViewportWidth * 1000) / 1000;
            State.mouse.ratioY = ~~ (State.mouse.y / State.currentViewportHeight * 1000) / 1000;

            if (State.mouse.diffX < 0) {
                State.mouse.inertiaX = ~~ Math.min(State.mouse.diffX, State.mouse.inertiaX);
                State.mouse.inertiaY = ~~ Math.min(State.mouse.diffY, State.mouse.inertiaY);
            }
            else {
                State.mouse.inertiaX = ~~ Math.max(State.mouse.diffX, State.mouse.inertiaX);
                State.mouse.inertiaY = ~~ Math.max(State.mouse.diffY, State.mouse.inertiaY);
            }
        }

    };

})(window.pm || (window.pm = {}));


/**
 * App
 *
 * The main package that initializes input devices, render classes, scenes,
 * assets, etc. Once this is set, it doesn't really need to be touched again.
 *
 * @package LosYorkJordan

 */

;(function(namespace) {
    'use strict';

    var Assets     = namespace.Assets,
        Colors     = namespace.Colors,
        Constants  = namespace.Constants,
        Events     = namespace.Events,
        Flags      = namespace.Flags,
        State      = namespace.State
    ;

    namespace.App = namespace.Base_View.extend({

        // <View_Pixi>
        pixi: null,

        // <Interval>
        healthCheckInterval: null,


        // Public Methods
        // -------------------------------------------------------------------

        initialize: function(options) {

            // bindings
            _.bindAll(this, 'onHealthCheck', 'onLoaded', 'onMouseIdle', 'onSceneChange');

            // enable mouse
            if (Flags.isTouch) {
                namespace.Input_Touch.enable();
            }
            else {
                namespace.Input_Mouse.enable();
            }

            Flags.isTouch    && $('body').addClass('is-touch');
            !Flags.isTouch   && $('body').addClass('is-mouse');
            Flags.isLocal    && $('body').addClass('is-local');
            Flags.isElectron && $('body').addClass('is-electron');
            !Flags.isElectron && $('body').addClass('is-web');
            $('body .renderer-type').html(Constants.RENDERER);

            // create pixi view
            this.pixi = new namespace.View_Pixi({
                el: $("#Game")
            });

            // create scenes
            if (Flags.sceneMain) {
                State.scene = new namespace.Scene_Main;
            }
            else if (Flags.sceneGrid) {
                State.scene = new namespace.Scene_Grid;
            }
            else {
                State.scene = new namespace.Scene_Intro;
            }

            // load all of the required assets
            Assets.load();

            //
            if (Constants.ENABLE_HEALTH_CHECKS) {
                this.healthCheckInterval = setInterval(this.onHealthCheck, this.HEALTH_CHECK_INTERVAL);
            }

            // event handlers
            namespace.on(Events.MOUSE_IDLE,   this.onMouseIdle);
            namespace.on(Events.SCENE_CHANGE, this.onSceneChange);
            namespace.on(Events.LOADED,       this.onLoaded);
            $(window).on(Events.RESIZE,       this.onResize);
        },

        restartApp: function() {
            window.location = window.location;
        },


        // Event Handlers
        // -------------------------------------------------------------------

        onLoaded: function(e) {
            // setup the intro scene
            State.scene.setup();

            // attach
            State.scene.attachEvents();

            // attach
            State.scene.animateIn();

            // add scene intro to document
            this.pixi.add(State.scene, State.scene.name);

            // start animating the scene
            this.pixi.start();
        },

        onHealthCheck: function() {

            // @todo, also add a framerate check where we allow for a certain
            // amount of drops until we fire

            if (
                State.tick > Constants.MAX_TICK_AMOUNT
            ) {
                // stop
                clearInterval(this.healthCheckInterval);

                // restart
                this.restartApp();
            }
        },

        onMouseIdle: function(level) {
            if (!Constants.ALLOW_IDLE_SCENE_CHANGE) {
                return false;
            }

            // main -> grid ( 30 seconds )
            if (level === 2 && State.scene.name == 'main') {
                State.scene.animateOut(function() {
                    namespace.trigger(Events.SCENE_CHANGE, {
                        scene: 'grid'
                    });
                });
            }

            // any -> intro ( 60 seconds )
            else if (level === 3 && State.scene.name == 'grid') {
                State.scene.animateOut(function() {
                    namespace.trigger(Events.SCENE_CHANGE, {
                        scene: 'intro'
                    });
                });
            }
        },

        onResize: function(e) {
            State.currentViewportWidth = window.innerWidth;
            State.currentViewportHeight = window.innerHeight;

            namespace.trigger(Events.RESIZE);
        },

        onSceneChange: function(e) {
            // animate out
            // State.scene.animateOut();
            State.oldScene = State.scene;
            State.oldScene.detachEvents();

            // log
            console.color("Scene " + e.scene, Colors.CRITICAL);

            //
            if (e.scene == 'main') {
                State.scene = new namespace.Scene_Main;
            }
            else if (e.scene == 'grid') {
                State.scene = new namespace.Scene_Grid;
            }
            else {
                State.scene = new namespace.Scene_Intro;
            }

            // setup
            State.scene.setup();

            // animate out
            State.scene.animateIn();

            // attach
            State.scene.attachEvents();

            // add new scene
            this.pixi.add(State.scene, State.scene.name);

            // remove old scene
            // setTimeout(function(scope, sceneName) {
            //     console.log("Removing scene");
                this.pixi.remove(State.oldScene.name);
                State.oldScene = null;
            // }, 1000, this, State.oldScene.name);
        }

    });

})(window.pm || (window.pm = {}));
