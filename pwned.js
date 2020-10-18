/*!
 * Mostly taken from the following two sources.
 *
 *
 * https://codepen.io/team/nclud/pen/MwaGGE
 *
 * Copyright (c) 2020 by nclud team (https://codepen.io/team/nclud/pen/MwaGGE)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 * https://codepen.io/lbebber/pen/XJRdrV
 *
 * Copyright (c) 2020 by Lucas Bebber (https://codepen.io/lbebber/pen/XJRdrV)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var matrix = null;

var remove = function(element) {
	element.parentElement.removeChild(element)
}

var view = function(element, over) {
	element.style.width = window.innerWidth;
	element.style.height = window.innerHeight;
	element.style.position = 'fixed';
	element.style.top = 0;
	element.style.left = 0;
	element.style.zIndex = 31337 + over;
}

var capture = function(callback) {
	html2canvas(document.body, {
		'onrendered': callback
	});
};

var glitch = function(image, callback, frames, rate, glitchParams, delta) {
	if (typeof rate === 'undefined')
		rate = 50;

	if (typeof glitchParams === 'undefined')
		glitchParams = {'size': 100, 'delay': 1, 'amplification': 0.5};

	if (typeof delta === 'undefined')
		delta = 0.1;

	var renderer, composer1, composer2, renderGlitch;

	var init = function() {
		var scene = new THREE.Scene();
		var sceneBg = new THREE.Scene();

		var camera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 1, 10000);
		camera.position.z = 100;

		var background = new THREE.MeshBasicMaterial({
			'map': THREE.ImageUtils.loadTexture(image),
			'depthTest': false
		});
		background.map.needsUpdate = true;

		var plane = new THREE.PlaneBufferGeometry(1, 1);
		var bgMesh = new THREE.Mesh(plane, background);
		bgMesh.position.z = 1;
		bgMesh.scale.set(window.innerWidth, window.innerHeight, 1);
		bgMesh.material.map.needsUpdate = true;
		sceneBg.add(bgMesh);

		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(0xffffff);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.autoClear = false;
		renderer.gammaInput = true;
		renderer.gammaOutput = true;

		view(renderer.domElement, 1);
		document.body.append(renderer.domElement);

		var targetParams = {'minFilter': THREE.LinearFilter, 'magFilter': THREE.LinearFilter, 'format': THREE.RGBFormat, 'stencilBuffer': true};

		composer1 = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, targetParams));
		var renderBackground = new THREE.RenderPass(sceneBg, camera);
		var clearMask = new THREE.ClearMaskPass();
		composer1.addPass(renderBackground);
		composer1.addPass(clearMask);

		composer2 = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, targetParams));
		var renderScene = new THREE.TexturePass(composer1.renderTarget2);
		renderScene.uniforms['tDiffuse'].value = composer1.renderTarget2;
		renderGlitch = new THREE.GlitchPass(glitchParams['size'], glitchParams['delay'], glitchParams['amplification']);
		renderGlitch.renderToScreen = true;
		composer2.addPass(renderScene);
		composer2.addPass(renderGlitch);
	}

	var render = function() {
		renderer.clear();
		composer1.render(delta);
		composer2.render(delta);
	}

	var glitching = true;

	var step = function() {
		if (glitching) {
			setTimeout(function() {
				render();
				requestAnimationFrame(step);
			}, rate);
		}
		else {
			callback && callback(renderer.domElement);
		}
	}

	init();
	step();

	setTimeout(function() {
		glitching = false;
	}, 1600);
}

var off = function(canvas, callback) {
	canvas.addEventListener('animationend', function(ev) {
		remove(canvas);

		callback && callback();
	}, false);

	canvas.className += 'turn-off';
};

var pwn = function() {
	capture(function(canvas) {
		glitch(canvas.toDataURL(), function(gcanvas) {
			var mcanvas = document.createElement('canvas');
			view(mcanvas, 0);
			mcanvas.style.background = '#000';
			document.body.append(mcanvas);

			matrix = new Matrix(mcanvas);
			matrix.start();

			off(gcanvas, function() {
				setTimeout(function() {
					matrix.write('MESS WITH THE BEST\n DIE LIKE THE REST', (window.innerWidth - 215)/2, window.innerHeight*0.35);
				}, 1400);
			});
		});
	});
};

//! BEGIN LOADER

var loadScripts = function(list, callback) {
	var script = document.createElement('script');
	script.src = list.shift();

	script.addEventListener('load', function(ev) {
		if (list.length > 0)
			loadScripts(list, callback);
		else
			callback && callback();
	}, false);

	document.body.append(script);
};

var loadStyles = function(list, callback) {
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = list.shift();

	link.addEventListener('load', function(ev) {
		if (list.length > 0)
			loadScripts(list, callback);
		else
			callback && callback();
	}, false);

	document.head.append(link);
};

var insertStyle = function(css, callback) {
	var style = document.createElement('style');

	style.innerHTML = css;

	document.head.append(style);

	callback && callback();
};

var load = function() {
	loadScripts([
		'https://cdn.rawgit.com/lilyinstarlight/matrix/main/matrix.js',
		'https://unpkg.com/three@0.70.1/three.min.js',
		'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141552/03_glitch.js',
		'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141552/08_texturepass.js',
		'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/CopyShader.js',
		'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/EffectComposer.js',
		'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/RenderPass.js',
		'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/ShaderPass.js',
		'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/MaskPass.js',
		'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/GlitchPass.js',
		'https://unpkg.com/html2canvas@1.0.0-rc.7/dist/html2canvas.min.js'
	], function() {
		insertStyle([
			'@font-face {',
				'font-family: "Matrix Code NFI";',
				'src: url("https://cdn.rawgit.com/lilyinstarlight/matrix/main/font/matrix-code-nfi.woff2");',
			'}',

			'@font-face {',
				'font-family: "Terminus TTF";',
				'src: url("https://cdn.rawgit.com/lilyinstarlight/matrix/main/font/terminus-ttf.woff2");',
			'}',

			'@keyframes turn-off {',
				'0% {',
					'transform: scale(1,1.3) translate3d(0,0,0);',
					'filter: brightness(1);',
				'}',

				'60% {',
					'transform: scale(1.3,0.001) translate3d(0,0,0);',
					'filter: brightness(10);',
				'}',

				'100% {',
					'transform: scale(0.000,0.0001) translate3d(0,0,0);',
					'filter: brightness(50);',
				'}',
			'}',

			'.turn-off {',
				'animation: turn-off 0.55s cubic-bezier(0.230, 1.000, 0.320, 1.000);',
				'animation-fill-mode: forwards;',
			'}'
		].join('\n'), function() {
			pwn();
		});
	});
};

load();
