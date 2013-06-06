function ExtensionManager(context) {
	this._init(context);
}

ExtensionManager.prototype = {
	_extensionPoints: {},
	
	_init: function(context) {
		this._context = context;
		
		context["malus.modules"].addModulesListener(function(action, module, param) {
			switch (action) {
			case "added":
			
			case "enabled":
			
			case "disabled":
			
			}
		}.bind(this));
	},
	
	addExtensionPoint: function(path, descriptor, modName) {
	
	},
	
	addExtension: function(path, descriptor, modName) {
	
	},
	
	addExtensionListener: function(listener) {
	
	},
	
	getExtensions: function(path) {
	
	},
	
	getExtensionObject: function(extension) {
	
	},
};

