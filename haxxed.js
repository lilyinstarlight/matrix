// Mostly taken from https://codepen.io/team/nclud/pen/MwaGGE and https://codepen.io/lbebber/pen/XJRdrV

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

var capture = function() {
	html2canvas(document.body, {
		'onrendered': function(canvas) {
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
		}
	});
};

var glitch = function(image, callback, frames, rate, glitchParams, delta) {
	if (typeof frames === 'undefined')
		frames = 100;

	if (typeof rate === 'undefined')
		rate = 100;

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
		renderGlitch.goWild = true;
		renderGlitch.renderToScreen = true;
		composer2.addPass(renderScene);
		composer2.addPass(renderGlitch);
	}

	var render = function() {
		renderer.clear();
		composer1.render(delta);
		composer2.render(delta);
	}

	var step = function() {
		if (frames > 0) {
			frames--;
			setTimeout(function() {
				render();
				requestAnimationFrame(step);
			}, rate);
		}
		else {
			renderGlitch.goWild = false;
			callback && callback(renderer.domElement);
		}
	}

	init();
	step();
}

var off = function(canvas, callback) {
	canvas.addEventListener('animationend', function(ev) {
		remove(canvas);

		callback && callback();
	}, false);

	canvas.className += 'turn-off';
};

var load = function(list, callback) {
	var script = document.createElement('script');
	script.src = list.shift();

	script.addEventListener('load', function(ev) {
		if (list.length > 0)
			load(list, callback);
		else
			callback && callback();
	}, false);

	document.body.append(script);
};

load([
	'https://gitcdn.link/repo/fkmclane/matrix/master/matrix.js',
	'https://cdnjs.cloudflare.com/ajax/libs/three.js/r70/three.min.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141552/03_glitch.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141552/08_texturepass.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/CopyShader.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/EffectComposer.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/RenderPass.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/ShaderPass.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/MaskPass.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/GlitchPass.js',
	'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js'
], function() {
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = 'https://gitcdn.link/repo/fkmclane/matrix/master/matrix.css';
	document.head.append(link);

	var style = document.createElement('style');
	style.innerHTML = [
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
	].join('\n')
	document.head.append(style);

	capture();
});
