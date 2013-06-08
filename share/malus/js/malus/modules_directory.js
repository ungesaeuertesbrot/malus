const GLib = imports.gi.GLib;

function DirectoryModuleProvider(path) {
	this._init(path);
}

DirectoryModuleProvider.prototype = {
	_init: function(path) {
		this._path = path;
	},
	
	getPath: function() {
		return this._path;
	},
	
	getResourceContents: function(resName) {
		let resPath = GLib.build_filenamev([this._path, resName]);
		// Only allow resources below the module's root directory
		if (resPath.substr(0, this._path.length) !== this._path)
			throw new Error("Illegal resource name '%s'".format(resName));
		let [success, res] = GLib.file_get_contents(resPath);
		if (!success)
			throw new Error("Could not read resource");
		return res;
	},
	
	getJsDirectory: function() {
		return GLib.build_filenamev([this._path, "js"]);
	},
};

