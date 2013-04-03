// TODO:
//   - Disable/Enable modules
//   - Dependencies
//   - Let modules provide module names as in .debs (depends on Dependencies)
//   - Make multiple modules with the same name coexist (depends on Dependencies and Provides)

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Context = imports.malus.context;


/**
 * Create a new Instance.
 */
function ModuleManager ()
{
	this._init ();
}

ModuleManager.prototype = {

	modules: {},
//	disabled: [],
	points: {},
	
	_init: function () {
		this._paths = {
			system: GLib.build_filenamev ([Context.paths.share, "modules"]),
			user: GLib.build_filenamev ([Context.paths.user_share, "modules"])
		}
		
		this.update ();
	},
	
	
	/**
	 * Internal helper function.
	 */
	_init_extension_point: function (pt) {
		if (!this.points[pt])
			this.points[pt] = {path: "", info: {}, extensions: [], listeners: []};
	},
	
	
	/**
	 * Internal helper function. Will set up the meta data for all extensions
	 * points of all modules.
	 */
	_preload_extensions: function () {
		for (let mod in this.modules) {
			let info = this.modules[mod].info;
			for (let extpt in info.extension_points) {
				this._init_extension_point (extpt);
				this.points[extpt].path = extpt;
				this.points[extpt].info = info.extension_points[extpt];

				let test_func = this.points[extpt].info.extension_test;
				if (test_func === undefined && this.points[extpt].info.test_args !== undefined)
					test_func = "malus/iface::implements_interface";

				if (test_func)
					try {
						this.points[extpt].info.test_func = this.get_module_function (mod, test_func);
					} catch (e) {
						printerr ("Warning: could not get extension point test function: " + e.message);
					}
			}
			
			for (let i = 0; i < info.extensions.length; i++) {
				let ext = info.extensions[i];
				this._init_extension_point (ext["extends"]);
				ext.module_name = mod;
				this.points[ext["extends"]].extensions.push (ext);
			}
		}
	},


	/**
	 * Update the internal list of available modules and extensions. This is
	 * called automatically when creating a new instance and must be called
	 * again each time a new modules has become available and needs to be found
	 * by the module manager.
	 * 
	 * Currently it will also immediately initialize all modules to work around
	 * a bug in GJS.
	 */
	update: function () {
		let module_dirs = {};
		
		for (let dir in this._paths) {
			let gfile = Gio.file_new_for_path (this._paths[dir]);
			if (!gfile.query_exists (null))
				continue;
			let enumerator = gfile.enumerate_children ("standard::name,standard::type", 0, null, null);
			if (!enumerator)
				continue;
			let dir_info;
			while ((dir_info = enumerator.next_file (null, null))) {
				if (dir_info.get_file_type () !== Gio.FileType.DIRECTORY)
					continue;
				let dir_name = dir_info.get_name ();
				module_dirs[dir_name] = GLib.build_filenamev ([gfile.get_path (), dir_name]);
			}
			enumerator.close (null);
		}
		
		this.modules = {};
		
		for (let dir in module_dirs) {
			let info_file_name = GLib.build_filenamev ([module_dirs[dir], "info.js"]);
			try {
				let info_file = GLib.file_get_contents (info_file_name);
				var module_info = JSON.parse (info_file[1]);
			} catch (e) {
				printerr ("Could not load module '{0}': {1}".format (dir, e.message));
				continue;
			}
			if (module_info.name != dir) {
				printerr ("Ignoring module: name mismatch for module in " + module_dirs[dir]);
				continue;
			}
			this.modules[dir] = {
				path: module_dirs[dir],
				info: module_info,
				initialized: false
			};
			// Work around a bug in GJS. Switch back to lazy initialization once
			// it's fixed.
			this.init_module (dir);
		}
		
		this._preload_extensions ();
	},
	
	
	/**
	 * Add an extension point manually.
	 *
	 * @arg {path} Path to the extension point.
	 * @arg {info} Info for the extension point. This is an object corresponding
	 *             to what would otherwise be found in the module's info.js.
	 */
	add_extension_point: function (path, info) {
		this._init_extension_point (path);
		this.points[path].path = path;
		this.points[path].info = info;
	},
	
	
	/**
	 * Make sure a module is in a usable state. Should not normally be used
	 * by applications.
	 *
	 * @arg {module} Name of the module.
	 * @returns The module meta object.
	 */
	init_module: function (module_name) {
		let module = this.modules[module_name];
		if (!module)
			throw new Error ("No such module " + module);
		if (module.initialized)
			return module;
			
		imports.searchPath.push (GLib.build_filenamev ([module.path, "js"]));
		module.initialized = true;
		if (module.info.init_func) {
			let init_func = this.get_module_function (module, module.info.init_func);
			init_func ();
		}
		
		return module;
	},
	
	
	get_module_directory: function (module_name) {
		return this.modules[module_name].path;
	},
	
	
	/**
	 * Get a specific function as defined in a specific module.
	 *
	 * @arg {module} Name of the module that contains the function.
	 * @arg {func_path} Name of the function. This consists of two parts,
	 *                  devided by a colon: The first is the namespace, i.e. the
	 *                  path to the file that conatins the function relative to
	 *                  the modules parts directory. The second is the name of
	 *                  the function itself, i.e. inside that file.
	 * @returns The corresponding function object.
	 */
	get_module_function: function (module_name, func_path) {
		let module = this.init_module (module_name);
		let func_loc = func_path.split ("::");
		try {
			var part = imports[func_loc[0]];
		} catch (e) {
			throw new Error ("ModuleManager.get_module_function: Could not load containing script at {0} in module {1}".format (func_path, module_name));
		}
		if (!part[func_loc[1]])
			throw new Error ("ModuleManager.get_module_function: No such function in script at {0} in module {1}".format (func_path, module_name));
		let result = part[func_loc[1]];
		if (typeof result != "function")
			throw new TypeError ("Not a function at {0} in module {1}".format (func_path, module.name));
		return part[func_loc[1]];
	},
	
	
	/**
	 * Get the object corresponding to an extension. This is where you interface
	 * the extension and interact with it. There will only be one single object
	 * for each extension.
	 *
	 * @arg {extension} The extension meta object describing the extension.
	 */
	get_extension_object: function (extension) {
		let module = this.init_module (extension.module_name);
		if (extension.obj)
			return extension.obj;
			
		let cls = this.get_module_function (extension.module_name, extension.extension_class);
		let obj = new cls ();
		let info = this.points[extension["extends"]].info;
		if (info.test_func && !info.test_func.apply (null, [obj].concat (info.test_args))) {
			printerr ("Error: interface test failed for extension at " + extension.extension_class);
			return null;
		}
		
		extension.obj = obj;
		return obj;
	},
	
	add_extension_listener: function (point, listener) {
		if (typeof listener != "function")
			throw new TypeError ("listener not a function");
		if (!point in this.points)
			throw new Error ("No such extension point " + point);
		point = this.points[point];
		for (let i = 0; i < point.listeners; i++)
			if (listener === point.listeners[i])
				return;
		point.listeners.push (listener);
		for (let i = 0; i < point.extensions.length; i++)
			listener (point.path, point.extensions[i]);
	}
};

