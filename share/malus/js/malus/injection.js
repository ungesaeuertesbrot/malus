function Injector(src)
{
	this._init(src);
}

Injector.prototype = {
	_init: function(src) {
		this._src = src;
	},
	
	_injectDirect: function(dest) {
		for (let [destKey, key] in Iterator(dest)) {
			if (typeof key !== "string")
				key = destKey;
			if (typeof this._src[key] === "undefined")
				printerr("!!WARNING: trying to inject '%s' which is not a defined injectable".format(key));
			else
				dest[destKey] = this._src[key];
		}
	},
	
	inject: function(dest, keys) {
		if (!keys) {
			this._injectDirect(dest);
			return;
		}
		
		let destNames = keys;
		if (!Array.isArray(keys))
			destNames = Object.keys(keys);
		for (let index in keys) {
			let destKey = destNames[index];
			let srcKey = keys[index];
			if (typeof this._src[srcKey] === "undefined")
				printerr("!!WARNING: trying to inject '%s' which is not a defined injectable".format(srcKey));
			else if (typeof dest[destKey] !== "undefined"
					 && dest[destKey] !== null)
				printerr("!!WARNING: trying to inject '%s' which is already set to '%s' in destination".format(destKey, dest[destKey].toString()));
			else
				dest[destKey] = this._src[srcKey];
		}
	},
	
	getInjectionSource: function() {
		return this._src;
	},
	
	addInjectable: function(key, injectable) {
		if (typeof this._src[key] !== "undefined")
			throw new Error("injectable with key '%s' already present.".format(key));
		this._src[key] = injectable;
	},
};

