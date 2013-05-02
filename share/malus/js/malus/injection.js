function Injector(src)
{
	this._init(src);
}

Injector.prototype = {
	_init: function(src) {
		this._src = src;
	},
	
	inject: function(dest, keys) {
		let dest_names = null;
		if (!keys) {
			keys = Object.keys(dest);
		} else if (!Array.isArray(keys)) {
			dest_names = keys;
			keys = Object.keys(keys);
		}
		for each (let src_key in keys) {
			let dest_key = dest_names ? dest_names[src_key] : src_key;
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

