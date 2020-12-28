(function (scope) {
	var done = 0;
	var todo = [];
	var time = [];
	var timeout = null;

	var next = function () {
		if (time.length > 0)
			timeout = setTimeout(exec, time.pop());
		else
			timeout = null;
	};

	var exec = function () {
		todo.pop()();

		next();

		done++;
	};

	scope.queue = function (delay, callback) {
		time.unshift(delay*1000);
		todo.unshift(callback);

		if (timeout === null)
			next();

		return done + todo.length - 1;
	};

	scope.cancel = function (idx) {
		if (idx < done || idx >= done + todo.length)
			return false;

		if (idx === done) {
			if (timeout !== null)
				clearTimeout(timeout);

			todo.pop();

			next();
		}
		else {
			time.splice(idx - done - 1, 1);
			todo.splice(idx - done, 1);
		}

		done++;

		return true;
	};
})(window);
