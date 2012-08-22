// TODO:
//   - Disable/Enable modules
//   - Dependencies
//   - Let modules provide module names as in .debs (depends on Dependencies)
//   - Make multiple modules with the same name coexist (depends on Dependencies and Provides)

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const Context = imports.malus.context;

function ModuleManager ()
{
	this.paths = {
		system: GLib.build_filenamev ([Context.paths.share, "modules"]),
		user: GLib.build_filenamev ([Context.paths.user_share, "modules"])
	}
}

ModuleManager.prototype = {

	modules: {},
//	disabled: [],
	points: {},
	
	update: function () {
		let module_dirs = {};
		
		for (let dir in this.paths) {
			let gfile = Gio.file_new_for_path (this.paths[dir]);
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
				printerr ("Could not load module '" + dir + "': " + e.message);
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
		}
		
		this.preload_extensions ();
	},
	
	init_extension_point: function (pt) {
		if (!this.points[pt])
			this.points[pt] = {path: "", info: {}, extensions: [], listeners: []};
	},
	
	add_extension_point: function (path, info) {
		this.init_extension_point (path);
		this.points[path].path = path;
		this.points[path].info = info;
	},
	
	preload_extensions: function () {
		for (let mod in this.modules) {
			let info = this.modules[mod].info;
			for (let extpt in info.extension_points) {
				this.init_extension_point (extpt);
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
				this.init_extension_point (ext["extends"]);
				ext.module = mod;
				this.points[ext["extends"]].extensions.push (ext);
			}
		}
	},

	init_module: function (module) {
		module = this.modules[module];
		if (!module)
			throw new Error ("No such module " + module);
		if (module.initialized)
			return module;
			
		imports.searchPath.unshift (GLib.build_filenamev ([module.path, "parts"]));
		module.initialized = true;
		if (module.info.init_func) {
			let init_func = this.get_module_function (module, module.info.init_func);
			init_func ();
		}
		
		return module;
	},
	
	get_module_function: function (module, func_path) {
		module = this.init_module (module);
		let func_loc = func_path.split ("::");
		try {
			var part = imports[func_loc[0]];
		} catch (e) {
			throw new Error ("ModuleManager.get_module_function: Could not load containing script at " + func_path + " in module " + module.name);
		}
		if (!part[func_loc[1]])
			throw new Error ("ModuleManager.get_module_function: No such function in script at " + func_path + " in module " + module.name);
		let result = part[func_loc[1]];
		if (typeof result != "function")
			throw new TypeError ("Not a function at " + func_path + " in module " + module.name);
		return part[func_loc[1]];
	},
	
	get_extension_object: function (extension) {
		let module = this.init_module (extension.module);
		if (extension.obj)
			return extension.obj;
			
		let cls_loc = extension.extension_class.split ("::");
		let script = GLib.build_filenamev ([this.modules[extension.module].path, "parts", cls_loc[0]]) + ".js";
		let ns = imports[cls_loc[0]];
		let cls = ns[cls_loc[1]];
		if (typeof cls !== "function")
			throw new TypeError ("Not a constructor at " + extension.extension_class + " in module " + module.name);
		let obj = new cls ();
		let info = this.points[extension["extends"]].info;
		if (info.test_func && !info.test_func.apply (null, [obj].concat (info.test_args)))
			return null;
		
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
