const DirProvider = imports.malus.mudules_directory;

const SETTING_DISABLED_MODULES = "malus.modules.disabled";

function ModuleManager(context) {
	this._init(context);
}

ModuleManager.prototype = {
	_modules: {},
	_disabledModules: [],
	
	_init: function(context) {
		this._context = context;
		this._paths = {
			system: GLib.build_filenamev([context["malus.paths"].share, "modules"]),
			user: GLib.build_filenamev([context["malus.paths"].userShare, "modules"])
		}
		
		this._injector = new Injection.Injector(context);
		
		this._disabledModules = context["malus.settings"].getValue(SETTING_DISABLED_MODULES, "");
		if (this._disabledModules.length > 0)
			this._disabledModules = this._disabledModules.split(",");
		
		this._listeners = [];
		
		this.update();
	},


	/**
	 * Get a specific function as defined in a specific module.
	 *
	 * @arg {module} Name of the module that contains the function.
	 * @arg {funcPath} Name of the function. This consists of two parts,
	 *                 devided by a colon: The first is the namespace, i.e. the
	 *                 path to the file that conatins the function relative to
	 *                 the modules parts directory. The second is the name of
	 *                 the function itself, i.e. inside that file.
	 * @returns The corresponding function object.
	 */
	getModuleFunction: function(modName, funcPath, funcName) {
		// required to make sure it is in the searchPath
		this._initModule(modName);
		
		try {
			var code = imports[funcPath];
		} catch (e) {
			throw new Error("ModuleManager.get_module_function: Could not load containing script at %s".format(funcPath));
		}
		let func = code[funcName];
		if (typeof func !== "function")
			throw new Error("ModuleManager.get_module_function: No such function '%s' in script at %s".format(funcName, funcPath));
		return func;
	},


	_decodeFunctionDescriptor: function(desc) {
		let parts = desc.split("::");
		if (parts.length !== 2)
			throw new Error("Invalid function descriptor '%s'".format(desc));
		return parts;
	},
	
	
	update: function () {
		let moduleProviders = {};
		
		for (let dir in this._paths) {
			let gfile = Gio.file_new_for_path(this._paths[dir]);
			if (!gfile.query_exists(null))
				continue;
			let enumerator = gfile.enumerate_children("standard::name,standard::type", 0, null, null);
			if (!enumerator)
				continue;
			let dirInfo;
			while ((fileInfo = enumerator.nextFile(null, null))) {
				let fileName = fileInfo.get_name();
				let filePath = GLib.build_filenamev([gfile.get_path (), fileName]);
				if (typeof this._modules[filePath] !== "undefined" && this._modules[filePath] !== null)
					continue;
				
				switch (fileInfo.get_file_type()) {
				case Gio.FileType.DIRECTORY:
					moduleProviders[filePath] = new DirProvider.DirectoryModuleProvider(filePath);
					break;
				}
			}
			enumerator.close(null);
		}
		
		for (let mp in moduleProviders) {
			try {
				let moduleInfo = mp.getResourceContents("info.js");
				moduleInfo = JSON.parse(moduleInfo);
			} catch (e) {
				logError(e, "Could not read information for module at location '%s': %s".format(mp.getPath(), e.message));
				continue;
			}
			
			if (typeof moduleInfo.Name !== "string") {
				log("No valid module name for module at localtion '%s'".format(mp.getPath()));
				continue;
			}
			
			this._modules[moduleInfo.Name] = {
				provider: mp,
				info: moduleInfo,
				initialized: false,
				searchPathInitialized: false,
			};
			
			// Work around a bug in GJS. Switch back to lazy initialization by
			// removing the following line once it's fixed.
			let enabled = this.isModuleEnabled(moduleInfo.Name);
			this._initModule(moduleInfo.Name, !enabled);
			let module = this._modules[moduleInfo.Name];
			
			this._listeners.forEach(function(val, index, array) {
				val("added", module, enabled);
			});
		}
	},
	
	
	_initModule: function(modName, searchPathOnly) {
		let module = this._modules[modName];
		if (!module)
			throw new Error("No such module '%s'".format(modName));
		if (module.initialized)
			return module;

		if (!this.isModuleEnabled(modName))
			throw new Error("Cannot initialize disabled module '%s'".format(modName));
		
		imports.searchPath.push(module.provider.getJsDirectory());
		module.searchPathInitialized = true;
		if (searchPathOnly)
			return module;
		
		if (module.info.InitFunc) {
			let initFunc = this.getFunction(this._decodeFunctionDescriptor(module.info.InitFunc));
			initFunc(this._injector);
		}
		module.initialized = true;
		
		return module;
	},
	
	
	isModuleEnabled: function(modName) {
		return this._disabledModules.indexOf(modName) === -1;
	},
	
	
	_saveDisabledState: function() {
		this._context["malus.settings"].setValue(SETTING_DISABLED_MODULES, this._disabledModules.join());
	},
	
	
	enableModule: function(modName) {
		let index = this._disabledModules.indexOf(modName);
		if (index < 0)
			return;
		this._disabledModules.splice(index, 1);
		this._saveDisabledState();
		
		let module = this._initModule(modName);
		
		this._listeners.forEach(function(val, index, array) {
			val("enabled", module);
		}, this);
	},
	
	
	disableModule: function(modName) {
		if (this._disabledModules.indexOf(modName) >= 0)
			return;
		this._disabledModules.push(modName);
		this._saveDisabledState();
		
		// There is currently *no way* we could remove a module from memory once
		// it has been loaded, due to the design of GJS! We will give the module
		// the opportunity to deconfigure itself though.
		
		let module = this._modules[modName];
		if (!module.initialized)
			return;
		
		let unloadFunc = module.info.UnloadFunc;
		if (typeof unloadFunc === "string")
			try {
				unloadFunc = this.getFunction(this._decodeFunctionDescriptor(unloadFunc));
				unloadFunc("disabled");
			} catch (e) {
				logError(e, "Error calling unload function for module '%s'".format(modName));
			}
		
		module.initialized = false;
		
		this._listeners.forEach(function(val, index, array) {
			val("disabled", module);
		}, this);
	},
	
	addModulesListener: function(listener) {
		if (typeof listener !== "function")
			throw new Error("listener must be a function");
		
		this._listeners.push(listener);
		
		this._modules.forEach(function(val, index, array) {
			listener("added", val, this.isModuleEnabled(val.info.Name));
		}, this);
	},
};

