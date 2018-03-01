window.Matrix = function(canvas, rate, spawn, matrix, console) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');

	if (typeof rate === 'undefined')
		rate = 30;

	this.rate = rate;

	this.delay = 1000/this.rate;

	if (typeof spawn === 'undefined')
		spawn = 3;

	this.spawn = spawn;

	if (typeof matrix === 'undefined')
		matrix = '24px Matrix Code NFI';

	this.matrix = matrix;

	if (typeof console === 'undefined')
		console = '24px Terminus TTF';

	this.console = console;

	this.cols = []
	this.codes = [];

	this.message = null;

	this.spawning = false;
	this.raining = false;
	this.writing = false;

	this.change = 0;

	this.scan = 0;

	this.timeout = null;

	this.font = this.matrix;

	this.resize = this.resize.bind(this);
	this.loop = this.loop.bind(this);
	this.code_tick = this.code_tick.bind(this);
	this.code_paint = this.code_paint.bind(this);

	window.addEventListener('resize', this.resize, false);

	this.resize();
};

window.Matrix.prototype.genSpawn = function() {
	return Math.floor(Math.random()*(this.spawn + 1));
};

window.Matrix.prototype.genCol = function() {
	do {
		var col = Math.floor(Math.random()*(this.width/this.charWidth + 1));
	}
	while (this.cols[col]);

	return col;
};

window.Matrix.prototype.genLength = function() {
	return Math.floor(Math.random()*(this.height/this.charHeight - 5) + 6);
};

window.Matrix.prototype.genChar = function() {
	var dictionary = '0123456789abcdefghijklmnopqrstuvwxyz';

	return dictionary.charAt(Math.floor(Math.random()*dictionary.length));
};

window.Matrix.prototype.rain = function() {
	this.change = 1;
	this.start();
};

window.Matrix.prototype.write = function(message, right, down, callback) {
	this.message = new window.Matrix.Message(this, message, right, down, callback);
	this.change = 2;
	this.start();
};

window.Matrix.prototype.update = function() {
	if (this.change !== 1 && this.change !== 3) {
		this.spawning = false;

		if (this.codes.length === 0)
			this.raining = false;
		else
			return;
	}
	else if (this.change !== 2 && this.change !== 3) {
		this.writing = false;
		this.message = null;
	}

	if (this.change === 1) {
		this.raining = true;
		this.spawning = true;

		this.font = this.matrix;
		this.resize();

		this.change = 0;
	}
	else if (this.change === 2) {
		this.writing = true;

		this.font = this.console;
		this.resize();

		this.change = 0;
	}
	else if (this.change === 3) {
		if (this.timeout !== null) {
			clearInterval(this.timeout);
			this.timeout = null;
		}

		this.change = 0;
	}
};

window.Matrix.prototype.code_tick = function(item, index) {
	return item.tick();
};

window.Matrix.prototype.tick = function() {
	if (this.change > 0)
		this.update();

	if (this.spawning) {
		var spawn = this.genSpawn();
		for (var code = 0; code < spawn; code++)
			this.codes.push(new window.Matrix.Code(this, this.genCol(), this.genLength()));
	}

	if (this.raining)
		this.codes = this.codes.filter(this.code_tick);
	else if (this.writing)
		this.message.tick();
};

window.Matrix.prototype.code_paint = function(item, index) {
	item.paint();
};

window.Matrix.prototype.paint = function() {
	this.context.clearRect(0, 0, this.width, this.height);

	if (this.raining)
		this.codes.forEach(this.code_paint);
	else if (this.writing)
		this.message.paint();

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

window.Matrix.prototype.clear = function() {
	this.codes = [];
	this.writing = false;
	this.message = null;

	this.paint();
};

window.Matrix.prototype.fullscreen = function() {
	if (document.fullscreenElement === this.canvas)
		document.exitFullscreen();
	else
		this.canvas.requestFullscreen();
};

window.Matrix.prototype.loop = function() {
	this.tick();
	this.paint();
};

window.Matrix.prototype.start = function() {
	if (this.timeout === null)
		this.timeout = setInterval(this.loop, this.delay);
};

window.Matrix.prototype.stop = function() {
	this.change = 3;
};

window.Matrix.prototype.resize = function() {
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

window.Matrix.Code = function(matrix, col, length) {
	this.matrix = matrix;
	this.col = col;
	this.length = length;
	this.bottom = 0;

	this.chars = [];

	this.char_paint = this.char_paint.bind(this);
};

window.Matrix.Code.prototype.tick = function() {
	this.chars.push(this.matrix.genChar());
	this.bottom++;

	while (this.chars.length > this.length)
		this.chars.shift();

	if (this.col >= this.matrix.cols.length)
		return false;

	this.matrix.cols[this.col] = this.chars.length < this.length;

	return Math.floor((this.bottom - this.chars.length)*this.matrix.charHeight) < this.matrix.height;
};

window.Matrix.Code.prototype.char_paint = function(item, index) {
	if (index === this.chars.length - 1 && this.matrix.context.fillStyle !== '#ddd')
		this.matrix.context.fillStyle = '#ddd';
	else if (this.matrix.context.fillStyle !== '#4d4')
		this.matrix.context.fillStyle = '#4d4';

	if (index < 5 && this.chars.length >= this.length - 5)
		this.matrix.context.globalAlpha = (index - this.chars.length + this.length)/5.0;

	this.matrix.context.fillText(item, this.col*this.matrix.charWidth, (this.bottom - (this.chars.length - 1) + index)*this.matrix.charHeight);

	if (index < 5 && this.chars.length >= this.length - 5)
		this.matrix.context.globalAlpha = 1.0;
};

window.Matrix.Code.prototype.paint = function() {
	this.chars.forEach(this.char_paint);
};

window.Matrix.Message = function(matrix, message, right, down, callback) {
	this.matrix = matrix;
	this.message = message;

	if (typeof right === 'undefined')
		right = 20;

	this.right = right;

	if (typeof down === 'undefined')
		down = 20;

	this.down = down;

	this.callback = callback;

	this.chars = 0;
	this.count = 0;

	this.cursor = '';

	this.paint_line = this.paint_line.bind(this);
};

window.Matrix.Message.prototype.tick = function() {
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
				this.cursor = '█';
			else
				this.cursor = '';
		}
	}

	return this.matrix.message === this;
};

window.Matrix.Message.prototype.paint_line = function(item, idx) {
	this.matrix.context.fillText(item, this.right, (idx + 1)*this.matrix.charHeight + this.down);
};

window.Matrix.Message.prototype.paint = function() {
	if (this.matrix.context.fillStyle !== '#4d4')
		this.matrix.context.fillStyle = '#4d4';

	(this.message.substring(0, this.chars) + this.cursor).split('\n').forEach(this.paint_line)
};
