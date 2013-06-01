function Injector(src)
{
	this._init(src);
}

Injector.prototype = {
	_init: function(src) {
		this._src = src;
	},
	
	_inject_direct: function(dest) {
		for (let [dest_key, key] in Iterator(dest)) {
			if (typeof key !== "string")
				key = dest_key;
			if (typeof this._src[key] === "undefined")
				printerr("!!WARNING: trying to inject '%s' which is not a defined injectable".format(key));
			else
				dest[dest_key] = this._src[key];
		}
	},
	
	inject: function(dest, keys) {
		if (!keys) {
			this._inject_direct(dest);
			return;
		}
		
		let dest_names = keys;
		if (!Array.isArray(keys))
			dest_names = Object.keys(keys);
		for (let index in keys) {
			let dest_key = dest_names[index];
			let src_key = keys[index];
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

