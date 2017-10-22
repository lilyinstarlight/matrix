if (!document.fullscreen) {
	var fullscreenPolyfill = new Object();

	fullscreenPolyfill.fullscreen = false;
	fullscreenPolyfill.fullscreenEnabled = false;
	fullscreenPolyfill.fullscreenElement = undefined;

	fullscreenPolyfill.fullscreenchangeEvent = undefined;
	fullscreenPolyfill.fullscreenerrorEvent = undefined;

	fullscreenPolyfill.reload = function() {
		document.fullscreen = document.mozFullScreen || document.webkitIsFullscreen || fullscreenPolyfill.fullscreen;
		document.fullscreenEnabled = document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled || fullscreenPolyfill.fullscreenEnabled;
		document.fullscreenElement = document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement || fullscreenPolyfill.fullscreenElement;
	}

	fullscreenPolyfill.onfullscreenchange = function(e) {
		if (e === fullscreenPolyfill.fullscreenchangeEvent)
			return;

		e.stopPropagation();

		var ev = document.createEvent('Event');
		ev.initEvent('fullscreenchange', true, false);

		fullscreenPolyfill.fullscreenchangeEvent = ev;

		e.target.dispatchEvent(ev);

		if (document.onfullscreenchange)
			document.onfullscreenchange(ev);

		fullscreenPolyfill.reload();
	}

	document.addEventListener('mozfullscreenchange', fullscreenPolyfill.onfullscreenchange, false);
	document.addEventListener('webkitfullscreenchange', fullscreenPolyfill.onfullscreenchange, false);
	document.addEventListener('msfullscreenchange', fullscreenPolyfill.onfullscreenchange, false);

	fullscreenPolyfill.onfullscreenerror = function(e) {
		if (e === fullscreenPolyfill.fullscreenerrorEvent)
			return;

		e.stopPropagation();

		var ev = document.createEvent('Event');
		ev.initEvent('fullscreenerror', true, false);

		fullscreenPolyfill.fullscreenerrorEvent = ev;

		e.target.dispatchEvent(ev);

		if (document.onfullscreenerror)
			document.onfullscreenerror(ev);

		fullscreenPolyfill.reload();
	}

	document.addEventListener('mozfullscreenerror', fullscreenPolyfill.onfullscreenerror, false);
	document.addEventListener('webkitfullscreenerror', fullscreenPolyfill.onfullscreenerror, false);
	document.addEventListener('msfullscreenerror', fullscreenPolyfill.onfullscreenerror, false);

	document.exitFullscreen = function() {
		var exitFullscreen = document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen || undefined;

		if (exitFullscreen)
			exitFullscreen.call(document);

		fullscreenPolyfill.reload();
	}

	Element.prototype.requestFullscreen = function() {
		var requestFullscreen = Element.prototype.mozRequestFullScreen || Element.prototype.webkitRequestFullscreen || Element.prototype.msRequestFullscreen || undefined;

		if (requestFullscreen)
			requestFullscreen.call(this);

		fullscreenPolyfill.reload();
	}

	fullscreenPolyfill.reload();
}
