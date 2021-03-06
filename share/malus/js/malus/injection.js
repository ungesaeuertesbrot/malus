function Injector(src)
{
	this._init(src);
}

Injector.prototype = {
	_init: function(src) {
		this._src = src;
	},
	
	_injectDirect: function(dest, noWarn) {
		for (let [destKey, key] in Iterator(dest)) {
			if (typeof key !== "string")
				key = destKey;
			if (typeof this._src[key] === "undefined")
				noWarn || printerr("!!WARNING: trying to inject '%s' which is not a defined injectable".format(key));
			else
				dest[destKey] = this._src[key];
		}
	},
	
	inject: function(dest, keys, noWarn) {
		if (!keys) {
			this._injectDirect(dest, noWarn);
			return;
		}
		
		let destNames = keys;
		let getDestKey = function(index) {return keys[index];};
		if (!Array.isArray(keys)) {
			destNames = Object.keys(keys);
			getDestKey = function(index) {return index;};
		}
		for (let index in keys) {
			let srcKey = keys[index];
			let destKey = getDestKey(index);
			if (typeof this._src[srcKey] === "undefined")
				noWarn || printerr("!!WARNING: trying to inject '%s' which is not a defined injectable".format(srcKey));
			else if (typeof dest[destKey] !== "undefined"
					 && dest[destKey] !== null)
				noWarn || printerr("!!WARNING: trying to inject '%s' which is already set to '%s' in destination".format(destKey, dest[destKey].toString()));
			else
				dest[destKey] = this._src[srcKey];
		}
	},
	
	getInjectionSource: function() {
		return this._src;
	},
	
	addInjectable: function(key, injectable) {
		if (typeof key !== "string")
			throw new Error("key must be a valid string");
		if (typeof this._src[key] !== "undefined")
			throw new Error("injectable with key '%s' already present.".format(key));
		this._src[key] = injectable;
	},
	
	/**
	 * Will create an Injector with an injection source derived from the source
	 * of the current injector (i.e. the source of the current injector is the
	 * prototype of the child injector). This means that all current and future
	 * injectables of the current source are visible in the child source but
	 * changes in the child source will not write through to the parent source.
	 *
	 * @returns A newly create `Injector`
	 */
	createChildInjector: function() {
		let childSource = Object.create(this._src);
		return new Injector(childSource);
	},
};

