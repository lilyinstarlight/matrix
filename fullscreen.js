(function (scope) {
	if (!scope.document.fullscreenElement) {
		var polyfill = new Object();

		polyfill.fullscreen = false;
		polyfill.fullscreenEnabled = false;
		polyfill.fullscreenElement = undefined;

		polyfill.fullscreenchangeEvent = undefined;
		polyfill.fullscreenerrorEvent = undefined;

		polyfill.reload = function () {
			scope.document.fullscreenEnabled = scope.document.mozFullScreenEnabled || scope.document.webkitFullscreenEnabled || scope.document.msFullscreenEnabled || polyfill.fullscreenEnabled;
			scope.document.fullscreenElement = scope.document.mozFullScreenElement || scope.document.webkitFullscreenElement || scope.document.msFullscreenElement || polyfill.fullscreenElement;
			scope.document.fullscreen = scope.document.mozFullScreen || scope.document.webkitIsFullscreen || polyfill.fullscreen;
		}

		polyfill.onfullscreenchange = function (e) {
			if (e === polyfill.fullscreenchangeEvent)
				return;

			e.stopPropagation();

			var ev = scope.document.createEvent('Event');
			ev.initEvent('fullscreenchange', true, false);

			polyfill.fullscreenchangeEvent = ev;

			e.target.dispatchEvent(ev);

			if (scope.document.onfullscreenchange)
				scope.document.onfullscreenchange(ev);

			polyfill.reload();
		}

		scope.document.addEventListener('mozfullscreenchange', polyfill.onfullscreenchange, false);
		scope.document.addEventListener('webkitfullscreenchange', polyfill.onfullscreenchange, false);
		scope.document.addEventListener('msfullscreenchange', polyfill.onfullscreenchange, false);

		polyfill.onfullscreenerror = function (e) {
			if (e === polyfill.fullscreenerrorEvent)
				return;

			e.stopPropagation();

			var ev = scope.document.createEvent('Event');
			ev.initEvent('fullscreenerror', true, false);

			polyfill.fullscreenerrorEvent = ev;

			e.target.dispatchEvent(ev);

			if (scope.document.onfullscreenerror)
				scope.document.onfullscreenerror(ev);

			polyfill.reload();
		}

		scope.document.addEventListener('mozfullscreenerror', polyfill.onfullscreenerror, false);
		scope.document.addEventListener('webkitfullscreenerror', polyfill.onfullscreenerror, false);
		scope.document.addEventListener('msfullscreenerror', polyfill.onfullscreenerror, false);

		scope.document.exitFullscreen = function () {
			var exitFullscreen = scope.document.mozCancelFullScreen || scope.document.webkitExitFullscreen || scope.document.msExitFullscreen || undefined;

			if (exitFullscreen)
				exitFullscreen.call(scope.document);

			polyfill.reload();
		}

		scope.Element.prototype.requestFullscreen = function () {
			var requestFullscreen = Element.prototype.mozRequestFullScreen || Element.prototype.webkitRequestFullscreen || Element.prototype.msRequestFullscreen || undefined;

			if (requestFullscreen)
				requestFullscreen.call(this);

			polyfill.reload();
		}

		polyfill.reload();
	}
})(window);
