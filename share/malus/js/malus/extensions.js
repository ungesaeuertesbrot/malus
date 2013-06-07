function ExtensionManager(context) {
	this._init(context);
}

ExtensionManager.prototype = {
	_extensionPoints: {},
	_modulesIndex: {},
	
	_init: function(context) {
		this._context = context;
		
		context["malus.modules"].addModulesListener(function(action, module, param) {
			switch (action) {
			case "added": {
				this._addModuleExtensions(module, param);
				break;
			}
			
			case "enabled":
			
			case "disabling": {
				// Disabling extensions is not yet implemented, so always veto
				// disabling modules that provide extensions.
				let modIndex = this._modulesIndex[module.Name];
				return typeof modIndex === "undefined" || modIndex.extensions.length === 0;
			}
			
			case "disabled":
			
			}
			
			return true;
		}.bind(this));
	},
	
	_initExtensionPoint: function(extPtPath, extPt) {
		if (typeof extPtPath !== "string" || extPtPath.length === 0)
			throw new Error("Extension point path (extPtPath) must be a string with non-zero length");
		
		if (typeof this._extensionPoints[extPtPath] === "undefined")
			this._extensionPoints[extPtPath] = {
				path: extPtPath,
				extPt: null,
				extensions: [],
				listeners: [],
			};
		
		let ptContainer = this._extensionPoints[extPtPath];
		
		if (extPt)
			ptContainer.extPt = extPt;
		
		return ptContainer;
	},
	
	_addModuleExtensions: function(module, enabled) {
		let modName = module.info.Name;
		let modExtPts = module.info.ExtensionPoints;
		let modExtensions = module.info.Extensions;
		
		if (!modExtPts)
			modExtPts = {};
		if (!modExtensions)
			modExtensions = [];
		
		this._modulesIndex[modName] = {};
		this._modulesIndex[modName].points = modExtPts;
		this._modulesIndex[modName].extensions = [];
		
		for (let [extPtPath, extPt] in Iterator(modExtPts))
			this.addExtensionPoint(extPtPath, extPt);
		
		for each (let extension in modExtensions)
			this.addExtension(extension, modName, !enabled);
	},
	
	addExtensionPoint: function(path, descriptor, modName) {
		descriptor.path = path;
		
		if (typeof descriptor.TestFunc !== "string"
			&& typeof descriptor.TestArgs === "object" && descriptor.TestArgs !== null)
			descriptor.TestFunc = "malus/iface::implementsInterface";
		
		this._initExtensionPoint(path, descriptor);
		
		if (modName) {
			if (typeof this._modulesIndex[modName] === "undefined")
				this._modulesIndex[modName] = {
					points: {},
					extensions: [],
				};
			this._modulesIndex[modName].points[path] = descriptor;
		}
	},
	
	addExtension: function(descriptor, modName, disabled) {
		let ptContainer = this._initExtensionPoint(descriptor.Path);
		ptContainer.extensions.push(descriptor);
		
		if (modName)
			this._modulesIndex[modName].extensions.push(descriptor);
		
		descriptor.modName = modName;
		descriptor.enabled = !disabled;
		
		for each (let listener in ptContainer.listeners)
			listener("added", descriptor);
	},
	
	removeExtension: function(path, descriptor) {
	
	},
	
	addExtensionListener: function(path, listener) {
		if (typeof listener !== "function")
			throw new Error("listener must be a function");
		
		let ptContainer = this._initExtensionPoint(path);
		ptContainer.listeners.push(listener);
		
		for each (extension in ptContainer.extensions)
			listener("added", extension);
	},
	
	getExtensions: function(path) {
		let ptContainer = this._initExtensionPoint(path);
		
		return ptContainer.extensions;
	},
	
	getExtensionObject: function(extension) {
		if (!extension.enabled)
			return null;
		
		try {
			var clsFunc = this._context["malus.modules"].getModuleFunction(extension.modName, extension.Class);
		} catch (e) {
			logError(e, "Could not get extension class");
			return null;
		}
		
		return new clsFunc(this._context["malus.injector"]);
	},
};

