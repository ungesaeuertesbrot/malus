function Injector(src)
{
	this._init(src);
}

Injector.prototype = {
	_init: function(src) {
		this._src = src;
	},
	
	inject: function(dest, keys) {
		if (!Array.isArray(keys))
			keys = dest.keys;
		for each (let key in keys) {
			if (typeof this._src[key] === "undefined")
				printerr("!!WARNING: trying to inject '%s' which is not a defined injectable".format(key));
			else if (typeof dest[key] !== "undefined"
					 && dest[key] !== null)
				printerr("!!WARNING: trying to inject '%s' which is already set to '%s' in destination".format(key, dest[key].toString()));
			else
				dest[key] = this._src[key];
		}
	},
	
	get_injection_source: function() {
		return this._src;
	},
	
	add_injectable: function(key, injectable) {
		if (typeof this._src[key] !== "undefined")
			throw new Error("injectable with key '%s' already present.".format(key));
		this._src[key] = injectable;
	},
};

