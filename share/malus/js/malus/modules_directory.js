const Gio = imports.gi.Gio;

function DirectoryModuleProvider(path) {
	this._init(path);
}

DirectoryModuleProvider.prototype = {
	_init: function(path) {
		this._path = path;
		this._gfile = Gio.file_new_for_path(path);
	},
	
	getPath: function() {
		return this._path;
	},
	
	getResourceContents: function(resName) {
		let resPath = this._gfile.get_relative_path(resName);
		// Only allow resources below the module's root directory
		if (resPath.substr(0, this._path.length) !== this._path)
			throw new Error("Illegal resource name '%s'".format(resName));
		return GLib.file_get_contents(resPath)[1];
	},
	
	getJsDirectory: function() {
		return this._gile.get_relative_path("js");
	},
};

