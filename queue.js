var todo = [];
var time = [];
var timeout = null;

var exec = function() {
	todo.pop()();

	if (time.length > 0)
		timeout = setTimeout(exec, time.pop());
	else
		timeout = null;
};

var queue = function(delay, callback) {
	time.unshift(delay*1000);
	todo.unshift(callback);

	if (timeout === null)
		timeout = setTimeout(exec, time.pop());
};
