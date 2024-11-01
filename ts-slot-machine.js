/* SlotMachine */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function init(jQuery, window, document, undefined) {

    var pluginName = 'slotMachine',
        defaults = {
        active: 0,
        delay: 200,
        auto: false,
        spins: 5,
        randomize: null,
        complete: null,
        stopHidden: true,
        direction: 'up' },
        FX_NO_TRANSITION = 'slotMachineNoTransition',
        FX_FAST = 'slotMachineBlurFast',
        FX_NORMAL = 'slotMachineBlurMedium',
        FX_SLOW = 'slotMachineBlurSlow',
        FX_TURTLE = 'slotMachineBlurTurtle',
        FX_GRADIENT = 'slotMachineGradient',
        FX_STOP = FX_GRADIENT;

    var Timer = (function () {
        function Timer(cb, delay) {
            _classCallCheck(this, Timer);

            this.cb = cb;
            this.initialDelay = delay;
            this.delay = delay;
            this.deferred = jQuery.Deferred();
            this.startTime = null;
            this.timer = null;
            this.running = false;

            this.resume();

            return this;
        }

        _createClass(Timer, [{
            key: '_start',
            value: function _start() {
                this.timer = setTimeout((function cb() {
                    this.cb.call(this);
                }).bind(this), this.delay);
            }
        }, {
            key: 'cancel',
            value: function cancel() {
                this.running = false;
                clearTimeout(this.timer);
            }
        }, {
            key: 'pause',
            value: function pause() {
                if (this.running) {
                    this.delay -= new Date().getTime() - this.startTime;
                    this.cancel();
                }
            }
        }, {
            key: 'resume',
            value: function resume() {
                if (!this.running) {
                    this.running = true;
                    this.startTime = new Date().getTime();

                    this._start();
                }
            }
        }, {
            key: 'reset',
            value: function reset() {
                this.cancel();
                this.delay = this.initialDelay;
                this._start();
            }
        }, {
            key: 'add',
            value: function add(extraDelay) {
                this.pause();
                this.delay += extraDelay;
                this.resume();
            }
        }]);

        return Timer;
    })();

    var SlotMachine = (function () {
        function SlotMachine(element, options) {
            _classCallCheck(this, SlotMachine);

            this.element = element;
            this.settings = jQuery.extend({}, defaults, options);
            this.defaults = defaults;
            this.name = pluginName;

            this.jQueryslot = jQuery(element);

            this.jQuerytiles = this.jQueryslot.children();

            this.jQuerycontainer = null;

            this._minTop = null;

            this._maxTop = null;

            this._jQueryfakeFirstTile = null;

            this._jQueryfakeLastTile = null;

            this._timer = null;

            this._spinsLeft = null;

            this.futureActive = null;

            this.running = false;

            this.stopping = false;

            this.active = this.settings.active;

            this.jQueryslot.css('overflow', 'hidden');

            this.jQuerycontainer = this.jQuerytiles.wrapAll('<div class="slotMachineContainer" />').parent();
            this.jQuerycontainer.css('transition', '1s ease-in-out');

            this._maxTop = -this.jQuerycontainer.height();

            this._initFakeTiles();

            this._minTop = -this._jQueryfakeFirstTile.outerHeight();

            this._initDirection();

            this.resetPosition();

            if (this.settings.auto !== false) {
                if (this.settings.auto === true) {
                    this.shuffle();
                } else {
                    this.auto();
                }
            }
        }

        _createClass(SlotMachine, [{
            key: '_initFakeTiles',
            value: function _initFakeTiles() {
                this._jQueryfakeFirstTile = this.jQuerytiles.last().clone();
                this._jQueryfakeLastTile = this.jQuerytiles.first().clone();

                this.jQuerycontainer.prepend(this._jQueryfakeFirstTile);
                this.jQuerycontainer.append(this._jQueryfakeLastTile);
            }
        }, {
            key: '_initDirection',
            value: function _initDirection() {
                this._direction = {
                    selected: this.settings.direction === 'down' ? 'down' : 'up',
                    up: {
                        key: 'up',
                        initial: this.getTileOffset(this.active),
                        first: 0,
                        last: this.getTileOffset(this.jQuerytiles.length),
                        to: this._maxTop,
                        firstToLast: this.getTileOffset(this.jQuerytiles.length),
                        lastToFirst: 0
                    },
                    down: {
                        key: 'down',
                        initial: this.getTileOffset(this.active),
                        first: this.getTileOffset(this.jQuerytiles.length),
                        last: 0,
                        to: this._minTop,
                        firstToLast: this.getTileOffset(this.jQuerytiles.length),
                        lastToFirst: 0
                    }
                };
            }
        }, {
            key: '_changeTransition',
            value: function _changeTransition() {
                var delay = this._delay || this.settings.delay,
                    transition = this._transition || this.settings.transition;
                this.jQuerycontainer.css('transition', delay + 's ' + transition);
            }
        }, {
            key: '_animate',
            value: function _animate(margin) {
                this.jQuerycontainer.css('transform', 'matrix(1, 0, 0, 1, 0, ' + margin + ')');
            }
        }, {
            key: '_isGoingBackward',
            value: function _isGoingBackward() {
                return this.futureActive > this.active && this.active === 0 && this.futureActive === this.jQuerytiles.length - 1;
            }
        }, {
            key: '_isGoingForward',
            value: function _isGoingForward() {
                return this.futureActive <= this.active && this.active === this.jQuerytiles.length - 1 && this.futureActive === 0;
            }
        }, {
            key: 'raf',
            value: function raf(cb, timeout) {
                var _raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                    startTime = new Date().getTime(),
                    _rafHandler = function _rafHandler() {
                    var drawStart = new Date().getTime(),
                        diff = drawStart - startTime;

                    if (diff < timeout) {
                        _raf(_rafHandler);
                    } else if (typeof cb === 'function') {
                        cb();
                    }
                };

                _raf(_rafHandler);
            }
        }, {
            key: 'getTileOffset',
            value: function getTileOffset(index) {
                var offset = 0;

                for (var i = 0; i < index; i++) {
                    offset += this.jQuerytiles.eq(i).outerHeight();
                }

                return this._minTop - offset;
            }
        }, {
            key: 'resetPosition',
            value: function resetPosition(margin) {
                this.jQuerycontainer.toggleClass(FX_NO_TRANSITION);
                this._animate(margin === undefined ? this.direction.initial : margin);

                this.jQuerycontainer[0].offsetHeight;
                this.jQuerycontainer.toggleClass(FX_NO_TRANSITION);
            }
        }, {
            key: 'setRandomize',
            value: function setRandomize(rnd) {
                this.settings.randomize = rnd;

                if (typeof rnd === 'number') {
                    this.settings.randomize = function () {
                        return rnd;
                    };
                }
            }
        }, {
            key: 'prev',
            value: function prev() {
                this.futureActive = this.prevIndex;
                this.running = true;
                this.stop();

                return this.futureActive;
            }
        }, {
            key: 'next',
            value: function next() {
                this.futureActive = this.nextIndex;
                this.running = true;
                this.stop();

                return this.futureActive;
            }
        }, {
            key: 'getDelayFromSpins',
            value: function getDelayFromSpins(spins) {
                var delay = this.settings.delay;
                this._transition = 'linear';

                switch (spins) {
                    case 1:
                        delay /= 0.5;
                        this._transition = 'ease-out';
                        this._animationFX = FX_TURTLE;
                        break;
                    case 2:
                        delay /= 0.75;
                        this._animationFX = FX_SLOW;
                        break;
                    case 3:
                        delay /= 1;
                        this._animationFX = FX_NORMAL;
                        break;
                    case 4:
                        delay /= 1.25;
                        this._animationFX = FX_NORMAL;
                        break;
                    default:
                        delay /= 1.5;
                        this._animationFX = FX_FAST;
                }

                return delay;
            }
        }, {
            key: 'shuffle',
            value: function shuffle(spins, onComplete) {
                var _this = this;

                if (typeof spins === 'function') {
                    onComplete = spins;
                }
                this.running = true;

                if (!this.visible && this.settings.stopHidden === true) {
                    this.stop(onComplete);
                } else {
                    var delay = this.getDelayFromSpins(spins);
                    this.delay = delay;
                    this._animate(this.direction.to);
                    this.raf(function () {
                        if (!_this.stopping && _this.running) {
                            var left = spins - 1;

                            _this.resetPosition(_this.direction.first);
                            if (left <= 1) {
                                _this.stop(onComplete);
                            } else {
                                _this.shuffle(left, onComplete);
                            }
                        }
                    }, delay);
                }

                return this.futureActive;
            }
        }, {
            key: 'stop',
            value: function stop(onStop) {
                var _this2 = this;

                if (!this.running || this.stopping) {
                    return this.futureActive;
                }

                this.running = true;
                this.stopping = true;

                if (this.futureActive === null) {
                    this.futureActive = this.custom;
                }

                if (this._isGoingBackward()) {
                    this.resetPosition(this.direction.firstToLast);
                } else if (this._isGoingForward()) {
                    this.resetPosition(this.direction.lastToFirst);
                }

                this.active = this.futureActive;

                var delay = this.getDelayFromSpins(1);
                this.delay = delay;
                this._animationFX = FX_STOP;
                this._animate(this.getTileOffset(this.active));
                this.raf(function () {
                    _this2.stopping = false;
                    _this2.running = false;
                    _this2.futureActive = null;

                    if (typeof _this2.settings.complete === 'function') {
                        _this2.settings.complete.apply(_this2, [_this2.active]);
                    }

                    if (typeof onStop === 'function') {
                        onStop.apply(_this2, [_this2.active]);
                    }
                }, delay);

                return this.active;
            }
        }, {
            key: 'auto',
            value: function auto() {
                var _this3 = this;

                if (!this.running) {
                    this._timer = new Timer(function () {
                        if (typeof _this3.settings.randomize !== 'function') {
                            _this3.settings.randomize = function () {
                                return _this3._nextIndex;
                            };
                        }
                        if (!_this3.visible && _this3.settings.stopHidden === true) {
                            _this3.raf(_this3._timer.reset.bind(_this3._timer), 500);
                        } else {
                            _this3.shuffle(_this3.settings.spins, _this3._timer.reset.bind(_this3._timer));
                        }
                    }, this.settings.auto);
                }
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this._jQueryfakeFirstTile.remove();
                this._jQueryfakeLastTile.remove();
                this.jQuerytiles.unwrap();
                jQuery.data(this.element[0], 'plugin_' + pluginName, null);
            }
        }, {
            key: 'active',
            get: function get() {
                return this._active;
            },
            set: function set(index) {
                this._active = index;
                if (index < 0 || index >= this.jQuerytiles.length) {
                    this._active = 0;
                }
            }
        }, {
            key: 'visibleTile',
            get: function get() {
                var firstTileHeight = this.jQuerytiles.first().height(),
                    rawContainerMargin = this.jQuerycontainer.css('transform'),
                    matrixRegExp = /^matrix\(-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?(-?\d+)\)jQuery/,
                    containerMargin = parseInt(rawContainerMargin.replace(matrixRegExp, 'jQuery1'), 10);

                return Math.abs(Math.round(containerMargin / firstTileHeight)) - 1;
            }
        }, {
            key: 'random',
            get: function get() {
                return Math.floor(Math.random() * this.jQuerytiles.length);
            }
        }, {
            key: 'custom',
            get: function get() {
                var choosen = void 0;

                if (typeof this.settings.randomize === 'function') {
                    var index = this.settings.randomize.call(this, this.active);
                    if (index < 0 || index >= this.jQuerytiles.length) {
                        index = 0;
                    }
                    choosen = index;
                } else {
                    choosen = this.random;
                }

                return choosen;
            }
        }, {
            key: 'direction',
            get: function get() {
                return this._direction[this._direction.selected];
            },
            set: function set(direction) {
                if (!this.running) {
                    this.direction = direction === 'down' ? 'down' : 'up';
                }
            }
        }, {
            key: '_prevIndex',
            get: function get() {
                var prevIndex = this.active - 1;

                return prevIndex < 0 ? this.jQuerytiles.length - 1 : prevIndex;
            }
        }, {
            key: '_nextIndex',
            get: function get() {
                var nextIndex = this.active + 1;

                return nextIndex < this.jQuerytiles.length ? nextIndex : 0;
            }
        }, {
            key: 'prevIndex',
            get: function get() {
                return this.direction === 'up' ? this._nextIndex : this._prevIndex;
            }
        }, {
            key: 'nextIndex',
            get: function get() {
                return this.direction === 'up' ? this._prevIndex : this._nextIndex;
            }
        }, {
            key: 'visible',
            get: function get() {
                var jQuerywindow = jQuery(window),
                    above = this.jQueryslot.offset().top > jQuerywindow.scrollTop() + jQuerywindow.height(),
                    below = jQuerywindow.scrollTop() > this.jQueryslot.height() + this.jQueryslot.offset().top;

                return !above && !below;
            }
        }, {
            key: '_fxClass',
            set: function set(FX_SPEED) {
                var classes = [FX_FAST, FX_NORMAL, FX_SLOW, FX_TURTLE].join(' ');

                this.jQuerytiles.add(this._jQueryfakeFirstTile).add(this._jQueryfakeLastTile).removeClass(classes).addClass(FX_SPEED);
            }
        }, {
            key: '_animationFX',
            set: function set(FX_SPEED) {
                var delay = this.settings.delay / 4,
                    jQueryelements = this.jQueryslot.add(this.jQuerytiles).add(this._jQueryfakeFirstTile).add(this._jQueryfakeLastTile);

                this.raf((function cb() {
                    this._fxClass = FX_SPEED;

                    if (FX_SPEED === FX_STOP) {
                        jQueryelements.removeClass(FX_GRADIENT);
                    } else {
                        jQueryelements.addClass(FX_GRADIENT);
                    }
                }).bind(this), delay);
            }
        }, {
            key: 'delay',
            set: function set(delay) {
                delay = delay / 1000;
                this._delay = delay;
                this._changeTransition();
            }
        }, {
            key: 'transition',
            set: function set(transition) {
                transition = transition || 'ease-in-out';
                this._transition = transition;
                this._changeTransition();
            }
        }]);

        return SlotMachine;
    })();

    function _getInstance(element, options) {
        var machine = void 0;
        if (!jQuery.data(element[0], 'plugin_' + pluginName)) {
            machine = new SlotMachine(element, options);
            jQuery.data(element[0], 'plugin_' + pluginName, machine);
        } else {
            machine = jQuery.data(element[0], 'plugin_' + pluginName);
        }
        return machine;
    }

    jQuery.fn[pluginName] = function initPlugin(options) {
        var _this4 = this;

        var instances = void 0;
        if (this.length === 1) {
            instances = _getInstance(this, options);
        } else {
            (function () {
                var jQueryels = _this4;
                instances = jQuery.map(jQueryels, function (el, index) {
                    var jQueryel = jQueryels.eq(index);
                    return _getInstance(jQueryel, options);
                });
            })();
        }
        return instances;
    };
})(jQuery, window, document);


/*
* The Actual Machina de Slotti
*/
            jQuery(document).ready(function(){
                var machine1 = jQuery("#machine1").slotMachine({
                    active  : 0,
                    delay   : 100
                });

                var machine2 = jQuery("#machine2").slotMachine({
                    active  : 1,
                    delay   : 300,
                    direction: 'down'
                });

                var machine3 = jQuery("#machine3").slotMachine({
                    active  : 2,
                    delay   : 600
                });

                function onComplete(active){
                    switch(this.element[0].id){
                        case 'machine1':
                            jQuery("#machine1Result").text("Index: "+this.active);
                            break;
                        case 'machine2':
                            jQuery("#machine2Result").text("Index: "+this.active);
                            break;
                        case 'machine3':
                            jQuery("#machine3Result").text("Index: "+this.active);
                            break;
                    }
                }

                jQuery("#startSlot").click(function(){

                    machine1.shuffle(5, onComplete);

                    setTimeout(function(){
                        machine2.shuffle(5, onComplete);
                    }, 300);

                    setTimeout(function(){
                        machine3.shuffle(5, onComplete);
                    }, 600);

                })
            });
