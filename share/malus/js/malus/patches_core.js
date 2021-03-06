/**
 * Format a string. We use the implementation provided by gjs and inject it into
 * the prototype of String so "%s %d".format("Give me", 5) becomes possible.
 *
 * @arg {arguments} The elements that should be substituted into the string.
 * @returns The formatted string.
 */
String.prototype.format = imports.format.format;


/**
 * Binds a function to an object, just as Function.prototype.bind does. The
 * difference is, that bind_once will allways return the same binding function
 * for the same parent function and set of arguments. Thus it is possible to use
 * the returned function in places like addEventListener and removeEventListener
 * where you need the same function object in several places. In short:
 *
 * var fun = function () {};
 * print (fun.bind_once (this) === fun.bind_once (this));
 *
 * prints true while if would print false if you used bind instead.
 *
 * @arg {that} The object the function is to be bound to.
 * @arg {arguments} All remaining arguments will be passed to the parent function.
 * @returns A function that binds the parent function to {that}.
 */
Function.prototype.bindOnce = function() {
	if (!this._bound)
		this._bound = [];
	for each (let b in this._bound) {
		let match = true;
		if (b.args.length !== arguments.length)
			continue;
		for (let i in b.args)
			if (b.args[i] !== arguments[i]) {
				match = false;
				break;
			}
		if (match)
			return b.marshaller;
	}
	
	// Not bound yet. Bind it. We can't use Function.prototype.bind though, because
	// it doesn't accept an arguments array. The code is stolen from MDN and slightly
	// modified.
	
	let marshaller = function() {
		if (typeof this !== "function") {  
			// closest thing possible to the ECMAScript 5 internal IsCallable function  
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");  
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			oThis = arguments[0],
			fToBind = this,
			fNOP = function () {},  
			fBound = function () {
				return fToBind.apply(this instanceof fNOP  
									? this  
									: oThis || window,  
									aArgs.concat(Array.prototype.slice.call(arguments)));  
				};

		fNOP.prototype = this.prototype;  
		fBound.prototype = new fNOP();  

		return fBound;  
	}.apply(this, arguments);
	this._bound.push({marshaller: marshaller, args: Array.prototype.slice.call(arguments)});
	return marshaller;
};

