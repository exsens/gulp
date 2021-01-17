
  "use strict";
 
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
  
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
  
  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  
  var HystModal = /*#__PURE__*/function () {
    function HystModal(props) {
      _classCallCheck(this, HystModal);
  
      var defaultConfig = {
        backscroll: true,
        linkAttributeName: 'data-hystmodal',
        closeOnOverlay: true,
        closeOnEsc: true,
        closeOnButton: true,
        waitTransitions: false,
        catchFocus: true,
        fixedSelectors: "*[data-hystfixed]",
        beforeOpen: function beforeOpen() {},
        afterClose: function afterClose() {}
      };
      this.config = Object.assign(defaultConfig, props);
  
      if (this.config.linkAttributeName) {
        this.init();
      }
  
      this._closeAfterTransition = this._closeAfterTransition.bind(this);
    }
  
    _createClass(HystModal, [{
      key: "init",
      value: function init() {
        this.isOpened = false;
        this.openedWindow = false;
        this.starter = false;
        this._nextWindows = false;
        this._scrollPosition = 0;
        this._reopenTrigger = false;
        this._overlayChecker = false;
        this._isMoved = false;
        this._focusElements = ['a[href]', 'area[href]', 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', 'select:not([disabled]):not([aria-hidden])', 'textarea:not([disabled]):not([aria-hidden])', 'button:not([disabled]):not([aria-hidden])', 'iframe', 'object', 'embed', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];
        this._modalBlock = false;
  
        if (!HystModal._shadow) {
          HystModal._shadow = document.createElement('button');
  
          HystModal._shadow.classList.add('hystmodal__shadow');
  
          document.body.appendChild(HystModal._shadow);
        }
  
        this.eventsFeeler();
      }
    }, {
      key: "eventsFeeler",
      value: function eventsFeeler() {
        document.addEventListener("click", function (e) {
          var clickedlink = e.target.closest("[" + this.config.linkAttributeName + "]");
  
          if (!this._isMoved && clickedlink) {
            e.preventDefault();
            this.starter = clickedlink;
            var targetSelector = this.starter.getAttribute(this.config.linkAttributeName);
            this._nextWindows = document.querySelector(targetSelector);
            this.open();
            return;
          }
  
          if (this.config.closeOnButton && e.target.closest('[data-hystclose]')) {
            this.close();
            return;
          }
        }.bind(this));
  
        if (this.config.closeOnOverlay) {
          document.addEventListener('mousedown', function (e) {
            if (!this._isMoved && e.target instanceof Element && !e.target.classList.contains('hystmodal__wrap')) return;
            this._overlayChecker = true;
          }.bind(this));
          document.addEventListener('mouseup', function (e) {
            if (!this._isMoved && e.target instanceof Element && this._overlayChecker && e.target.classList.contains('hystmodal__wrap')) {
              e.preventDefault();
              !this._overlayChecker;
              this.close();
              return;
            }
  
            this._overlayChecker = false;
          }.bind(this));
        }
  
        window.addEventListener("keydown", function (e) {
          if (!this._isMoved && this.config.closeOnEsc && e.which == 27 && this.isOpened) {
            e.preventDefault();
            this.close();
            return;
          }
  
          if (!this._isMoved && this.config.catchFocus && e.which == 9 && this.isOpened) {
            this.focusCatcher(e);
            return;
          }
        }.bind(this));
      }
    }, {
      key: "open",
      value: function open(selector) {
        if (selector) {
          if (typeof selector === "string") {
            this._nextWindows = document.querySelector(selector);
          } else {
            this._nextWindows = selector;
          }
        }
  
        if (!this._nextWindows) {
          console.log("Warning: hystModal selector is not found");
          return;
        }
  
        if (this.isOpened) {
          this._reopenTrigger = true;
          this.close();
          return;
        }
  
        this.openedWindow = this._nextWindows;
        this._modalBlock = this.openedWindow.querySelector('.hystmodal__window');
        this.config.beforeOpen(this);
  
        this._bodyScrollControl();
  
        HystModal._shadow.classList.add("hystmodal__shadow--show");
  
        this.openedWindow.classList.add("hystmodal--active");
        this.openedWindow.setAttribute('aria-hidden', 'false');
        if (this.config.catchFocus) this.focusControl();
        this.isOpened = true;
      }
    }, {
      key: "close",
      value: function close() {
        if (!this.isOpened) {
          return;
        }
  
        if (this.config.waitTransitions) {
          this.openedWindow.classList.add("hystmodal--moved");
          this._isMoved = true;
          this.openedWindow.addEventListener("transitionend", this._closeAfterTransition);
          this.openedWindow.classList.remove("hystmodal--active");
        } else {
          this.openedWindow.classList.remove("hystmodal--active");
  
          this._closeAfterTransition();
        }
      }
    }, {
      key: "_closeAfterTransition",
      value: function _closeAfterTransition() {
        this.openedWindow.classList.remove("hystmodal--moved");
        this.openedWindow.removeEventListener("transitionend", this._closeAfterTransition);
        this._isMoved = false;
  
        HystModal._shadow.classList.remove("hystmodal__shadow--show");
  
        this.openedWindow.setAttribute('aria-hidden', 'true');
        if (this.config.catchFocus) this.focusControl();
  
        this._bodyScrollControl();
  
        this.isOpened = false;
        this.openedWindow.scrollTop = 0;
        this.config.afterClose(this);
  
        if (this._reopenTrigger) {
          this._reopenTrigger = false;
          this.open();
        }
      }
    }, {
      key: "focusControl",
      value: function focusControl() {
        var nodes = this.openedWindow.querySelectorAll(this._focusElements);
  
        if (this.isOpened && this.starter) {
          this.starter.focus();
        } else {
          if (nodes.length) nodes[0].focus();
        }
      }
    }, {
      key: "focusCatcher",
      value: function focusCatcher(e) {
        var nodes = this.openedWindow.querySelectorAll(this._focusElements);
        var nodesArray = Array.prototype.slice.call(nodes);
  
        if (!this.openedWindow.contains(document.activeElement)) {
          nodesArray[0].focus();
          e.preventDefault();
        } else {
          var focusedItemIndex = nodesArray.indexOf(document.activeElement);
          console.log(focusedItemIndex);
  
          if (e.shiftKey && focusedItemIndex === 0) {
            nodesArray[nodesArray.length - 1].focus();
            e.preventDefault();
          }
  
          if (!e.shiftKey && focusedItemIndex === nodesArray.length - 1) {
            nodesArray[0].focus();
            e.preventDefault();
          }
        }
      }
    }, {
      key: "_bodyScrollControl",
      value: function _bodyScrollControl() {
        if (!this.config.backscroll) return; // collect fixed selectors to array
  
        var fixedSelectors = Array.prototype.slice.call(document.querySelectorAll(this.config.fixedSelectors));
        var html = document.documentElement;
  
        if (this.isOpened === true) {
          html.classList.remove("hystmodal__opened");
          html.style.marginRight = "";
          fixedSelectors.map(function (el) {
            el.style.marginRight = "";
          });
          window.scrollTo(0, this._scrollPosition);
          html.style.top = "";
          return;
        }
  
        this._scrollPosition = window.pageYOffset;
        var marginSize = window.innerWidth - html.clientWidth;
        html.style.top = -this._scrollPosition + "px";
  
        if (marginSize) {
          html.style.marginRight = marginSize + "px";
          fixedSelectors.map(function (el) {
            el.style.marginRight = parseInt(getComputedStyle(el).marginRight) + marginSize + "px";
          });
        }
  
        html.classList.add("hystmodal__opened");
      }
    }]);
  
    return HystModal;
  }();
  
  _defineProperty(HystModal, "_shadow", false);
 

const photoModal = new HystModal({
  linkAttributeName: "data-hystmodal",
});
