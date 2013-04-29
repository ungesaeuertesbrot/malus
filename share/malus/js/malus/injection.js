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
			keys = Object.keys(dest);
		for each (let dest_key in keys) {
			let src_key = dest_key;
			if (typeof dest_key === "object") {
				src_key = dest_key.src;
				dest_key = dest_key.dest;
			}
			if (typeof this._src[src_key] === "undefined")
				printerr("!!WARNING: trying to inject '%s' which is not a defined injectable".format(src_key));
			else if (typeof dest[dest_key] !== "undefined"
					 && dest[dest_key] !== null)
				printerr("!!WARNING: trying to inject '%s' which is already set to '%s' in destination".format(dest_key, dest[dest_key].toString()));
			else
				dest[dest_key] = this._src[src_key];
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

