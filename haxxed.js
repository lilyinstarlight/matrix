// Mostly taken from https://codepen.io/team/nclud/pen/MwaGGE

var matrix = null;

var remove = function(element) {
	element.parentElement.removeChild(element)
}

var copy = function(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL();

	var out = document.createElement('canvas');
	out.width = canvas.width;
	out.height = canvas.height;

	var context = out.getContext('2d');
	context.drawImage(image, 0, 0);

	return out;
}

var view = function(element) {
	element.style.width = window.innerWidth;
	element.style.height = window.innerHeight;
	element.style.position = 'fixed';
	element.style.top = 0;
	element.style.left = 0;
	element.style.zIndex = 31337;
}

var capture = function() {
	html2canvas(document.body, {
		'onrendered': function(canvas) {
			animate(canvas.toDataURL(), function(gcanvas) {
				var mcanvas = copy(gcanvas);
				view(mcanvas);
				mcanvas.style.background = '#000';
				document.body.append(mcanvas);
				remove(gcanvas);

				matrix = new Matrix(mcanvas);
				matrix.start();
				setTimeout(function() {
					matrix.write('MESS WITH THE BEST\n DIE LIKE THE REST', (window.innerWidth - 215)/2, window.innerHeight*0.35, function() {
						setTimeout(function() {
							matrix.rain();
						}, 6000);
					});
				}, 1400);
			});
		}
	});
};

var animate = function(image, callback, rate, glitchParams, delta) {
	if (typeof rate === 'undefined')
		rate = 100;

	if (typeof glitchParams === 'undefined')
		glitchParams = {'size': 100, 'delay': 1, 'amplification': 0.5};

	if (typeof delta === 'undefined')
		delta = 0.1;

	var renderer, composer1, composer2;

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
		sceneBg.add(bgMesh);

		bgMesh.material.map.needsUpdate = true;

		var sceneMask = new THREE.Scene();

		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(0xffffff);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.autoClear = false;

		renderer.gammaInput = true;
		renderer.gammaOutput = true;

		renderBackground = new THREE.RenderPass(sceneBg, camera);

		view(renderer.domElement);
		document.body.append(renderer.domElement);

		var targetParams = {'minFilter': THREE.LinearFilter, 'magFilter': THREE.LinearFilter, 'format': THREE.RGBFormat, 'stencilBuffer': true};

		var clearMask = new THREE.ClearMaskPass();

		composer1 = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, targetParams));
		var renderScene = new THREE.TexturePass(composer1.renderTarget2);
		composer1.addPass(renderBackground);
		composer1.addPass(clearMask);

		composer2 = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, targetParams));

		var renderGlitch = new THREE.GlitchPass(glitchParams['size'], glitchParams['delay'], glitchParams['amplification']);
		renderGlitch.renderToScreen = true;

		composer2.addPass(renderScene);
		composer2.addPass(renderGlitch);

		renderScene.uniforms[ 'tDiffuse' ].value = composer1.renderTarget2;
	}

	var render = function() {
		renderer.clear();
		composer1.render(delta);
		composer2.render(delta);
	}

	var glitch = true;

	var step = function() {
		if (glitch) {
			setTimeout(function() {
				render();
				requestAnimationFrame(step);
			}, rate);
		}
	}

	init();
	step();

	setTimeout(function() {
		callback && callback(renderer.domElement);
		glitch = false;
	}, 3400);
}

var load = function(list, callback) {
	var script = document.createElement('script');
	script.src = list.shift();

	script.addEventListener('load', function(ev) {
		if (list.length > 0)
			load(list, callback);
		else
			callback && callback();
	}, false);

	document.body.appendChild(script);
};

load([
	'https://gitcdn.link/repo/fkmclane/matrix/master/matrix.js',
	'https://cdnjs.cloudflare.com/ajax/libs/three.js/r70/three.min.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/CopyShader.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/EffectComposer.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/RenderPass.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/ShaderPass.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/MaskPass.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/t-18/GlitchPass.js'
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141552/03_glitch.js',
	'https://s3-us-west-2.amazonaws.com/s.cdpn.io/141552/08_texturepass.js',
	'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js',
], function() {
	capture();
});
