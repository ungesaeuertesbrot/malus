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
			
			case "disabled":
			
			}
		}.bind(this));
	},
	
	_initExtensionPoint: function(extPtPath, extPt) {
		if (typeof this._extensionPoints[extPtPath] === "undefined")
			this._extensionPoints[extPtPath} = {
				path: extPtPath,
				extPt: null,
				extensions: [],
				listeners: [],
			};
		
		let ptContainer = this._extensionPoints[extPtPath];
		
		if (extPt)
			ptContainer.extPt = extPt;
	},
	
	_addModuleExtensions: function(module, enabled) {
		let modName = module.info.Name;
		let modExtPts = module.info.ExtensionPoints;
		let motExtensions = module.info.Extensions;
		
		this._modulesIndex[modName] = {};
		this._modulesIndex[modName].points = modExtPts;
		this._modulesIndex[modName].extensions = modExtensions;
		
		for (let [extPtPath, extPt] in Iterator(modExtPts)) {
			extPt.path = extPtPath;
			
			if (typeof extPt.TestFunc !== "string"
				&& typeof extPt.TestArgs === "object" && extPt.TestArgs !== null)
				extPt.TestFunc = "malus/iface::implementsInterface";
			
			this._initExtensionPoint(extPtPath, extPt);
		}
	},
	
	addExtensionPoint: function(path, descriptor, modName) {
	
	},
	
	addExtension: function(path, descriptor, modName) {
	
	},
	
	removeExtension: function(path, descriptor) {
	
	},
	
	addExtensionListener: function(listener) {
	
	},
	
	getExtensions: function(path) {
	
	},
	
	getExtensionObject: function(extension) {
	
	},
};

