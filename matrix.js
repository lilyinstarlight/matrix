window.Matrix = function (canvas, rate, spawn, matrix, console) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');

	this.rate = rate || 30;

	this.delay = 1000/this.rate;

	this.spawn = spawn || 10;

	this.matrix = matrix || '24px Matrix Code NFI';

	this.console = console || '24px Terminus TTF';

	this.chars = '0123456789abcdefghijklmnopqrstuvwxyz';

	this.cols = []
	this.codes = [];

	this.message = null;

	this.spawning = false;
	this.raining = false;
	this.writing = false;

	this.state = 'stopped';
	this.mode = 'idle';

	this.scan = 0;

	this.timeout = null;

	this.font = this.matrix;

	window.addEventListener('resize', this.resize.bind(this), false);

	this.resize();
};

window.Matrix.prototype.genSpawn = function () {
	return Math.floor(Math.random()*(this.spawn/10 + 1));
};

window.Matrix.prototype.genCol = function () {
	var col;

	do {
		col = Math.floor(Math.random()*(this.width/this.charWidth + 1));
	}
	while (this.cols[col]);

	return col;
};

window.Matrix.prototype.genLength = function () {
	return Math.floor(Math.random()*(this.height/this.charHeight - 5) + 6);
};

window.Matrix.prototype.genRate = function () {
	return Math.floor(Math.random()*(this.rate - this.rate/2) + this.rate/2);
};

window.Matrix.prototype.genChar = function () {
	return this.chars.charAt(Math.floor(Math.random()*this.chars.length));
};

window.Matrix.prototype.genChange = function (length) {
	if (Math.random()*this.rate > this.rate/8)
		return -1;
	else
		return Math.floor(Math.random()*length);
};

window.Matrix.prototype.update = function () {
	if (!(this.state === 'draining' || this.state === 'stopping' || this.state === 'paused' || this.state === 'stopped') && (
			(this.mode === 'rain' && this.state !== 'raining') ||
			(this.mode === 'message' && this.state !== 'writing') ||
			(this.mode === 'idle' && this.state !== 'idling')))
		this.state = 'draining';

	if (this.state === 'raining') {
		this.raining = true;
		this.spawning = true;
		this.writing = false;
		this.message = null;

		this.font = this.matrix;
		this.resize();
	}
	else if (this.state === 'writing') {
		this.raining = false;
		this.spawning = false;
		this.writing = true;

		this.font = this.console;
		this.resize();
	}
	else if (this.state === 'draining' || this.state === 'stopping') {
		this.spawning = false;

		if (this.codes.length === 0) {
			this.raining = false;

			if (this.state === 'stopping') {
				this.state = 'stopped';
			}
			else {
				if (this.mode === 'rain')
					this.state = 'raining';
				else if (this.mode === 'message')
					this.state = 'writing';
				else
					this.state = 'idling';
			}
		}
	}
	else if (this.state === 'idling') {
		this.raining = false;
		this.spawning = false;
		this.writing = false;
		this.message = null;
	}
	else if (this.state === 'paused' || this.state === 'stopped') {
		if (this.timeout !== null) {
			clearInterval(this.timeout);
			this.timeout = null;
		}
	}
};

window.Matrix.prototype.tick = function () {
	this.update();

	if (this.spawning) {
		var spawn = this.genSpawn();
		for (var code = 0; code < spawn; code++)
			this.codes.push(new window.Matrix.Code(this, this.genCol(), this.genLength(), this.genRate()));
	}

	if (this.raining)
		this.codes = this.codes.filter(function (item, index) {
			return item.tick();
		});
	else if (this.writing)
		this.message.tick();
};

window.Matrix.prototype.draw = function () {
	this.context.clearRect(0, 0, this.width, this.height);

	if (this.raining)
		this.codes.forEach(function (item, index) {
			item.draw();
		});
	else if (this.writing)
		this.message.draw();

	if (this.context.lineWidth !== 0.5)
		this.context.lineWidth = 0.5;
	if (this.context.strokeStyle !== '#777')
		this.context.strokeStyle = '#777';

	for (var row = this.scan; row < this.height + 4; row += 4) {
		this.context.beginPath();
		this.context.moveTo(0, row);
		this.context.lineTo(this.width, row);
		this.context.stroke();
	}

	this.scan = (this.scan + 1) % 4;
};

window.Matrix.prototype.clear = function () {
	this.codes = [];
	this.writing = false;
	this.message = null;

	this.draw();
};

window.Matrix.prototype.fullscreen = function () {
	if (document.fullscreenElement === this.canvas)
		document.exitFullscreen();
	else
		this.canvas.requestFullscreen();
};

window.Matrix.prototype.loop = function () {
	this.tick();
	this.draw();
};

window.Matrix.prototype.rain = function () {
	this.mode = 'rain'

	this.start();
};

window.Matrix.prototype.write = function (message, right, down, callback) {
	this.message = new window.Matrix.Message(this, message, right, down, callback);

	this.mode = 'message'

	this.start();
};

window.Matrix.prototype.idle = function () {
	this.mode = 'idle'

	this.start();
};

window.Matrix.prototype.start = function () {
	if (this.timeout === null) {
		if (this.state === 'paused' || this.state === 'stopping' || this.state === 'stopped') {
			if (this.mode === 'rain')
				this.state = 'raining';
			else if (this.mode === 'message')
				this.state = 'writing';
			else
				this.state = 'idling';
		}

		this.timeout = setInterval(this.loop.bind(this), this.delay);
	}
};

window.Matrix.prototype.stop = function () {
	if (this.timeout !== null) {
		this.state = 'stopping';
	}
};

window.Matrix.prototype.pause = function () {
	if (this.timeout !== null) {
		this.state = 'paused';
	}
};

window.Matrix.prototype.resize = function () {
	this.canvas.height = window.innerHeight;
	this.canvas.width = window.innerWidth;

	this.height = this.canvas.height;
	this.width = this.canvas.width;

	this.context.font = this.font;

	this.charWidth = this.context.measureText('a').width + 6;
	this.charHeight = parseInt(this.font);

	var oldLength = this.cols.length;
	this.cols.length = Math.floor(this.width/this.charWidth + 1);
	this.cols.fill(0, oldLength);
};

window.Matrix.Code = function (matrix, col, length, rate) {
	this.matrix = matrix;
	this.col = col;
	this.length = length;
	this.rate = rate;
	this.count = 0;
	this.bottom = 0;

	this.chars = [];
};

window.Matrix.Code.prototype.tick = function () {
	this.count++;

	if (this.count >= this.rate/10) {
		this.count = 0;

		this.chars.push(this.matrix.genChar());
		this.bottom++;
	}

	while (this.chars.length > this.length)
		this.chars.shift();

	var change = this.matrix.genChange(this.chars.length);
	if (change >= 0)
		this.chars[change] = this.matrix.genChar();

	if (this.col >= this.matrix.cols.length)
		return false;

	this.matrix.cols[this.col] = this.chars.length < this.length;

	return Math.floor((this.bottom - this.chars.length)*this.matrix.charHeight) < this.matrix.height;
};

window.Matrix.Code.prototype.draw = function () {
	this.chars.forEach((function (item, index) {
		if (index === this.chars.length - 1 && this.matrix.context.fillStyle !== '#ddd')
			this.matrix.context.fillStyle = '#ddd';
		else if (this.matrix.context.fillStyle !== '#4d4')
			this.matrix.context.fillStyle = '#4d4';

		if (index < 5 && this.chars.length >= this.length - 5)
			this.matrix.context.globalAlpha = (index - this.chars.length + this.length)/5.0;

		this.matrix.context.fillText(item, this.col*this.matrix.charWidth, (this.bottom - (this.chars.length - 1) + index)*this.matrix.charHeight);

		if (index < 5 && this.chars.length >= this.length - 5)
			this.matrix.context.globalAlpha = 1.0;
	}).bind(this));
};

window.Matrix.Message = function (matrix, message, right, down, callback) {
	this.matrix = matrix;
	this.message = message;

	this.right = right || 20;

	this.down = down || 20;

	this.callback = callback;

	this.chars = 0;
	this.count = 0;

	this.cursor = '';
};

window.Matrix.Message.prototype.tick = function () {
	this.count++;

	if (this.chars < this.message.length) {
		if (this.count % (this.matrix.rate/10) === 0)
			this.chars++;

		if (this.chars >= this.message.length && this.callback)
			this.callback();
	}
	else {
		if (this.count >= this.matrix.rate) {
			this.count = 0;

			if (this.cursor === '')
				this.cursor = '\u2588';
			else
				this.cursor = '';
		}
	}

	return this.matrix.message === this;
};

window.Matrix.Message.prototype.draw = function () {
	if (this.matrix.context.fillStyle !== '#4d4')
		this.matrix.context.fillStyle = '#4d4';

	(this.message.substring(0, this.chars) + this.cursor).split('\n').forEach((function (item, idx) {
		this.matrix.context.fillText(item, this.right, (idx + 1)*this.matrix.charHeight + this.down);
	}).bind(this));
}
