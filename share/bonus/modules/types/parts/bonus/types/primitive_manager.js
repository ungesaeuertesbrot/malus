const Lang = imports.lang;

const Context = imports.malus.context;

function PrimitiveManager ()
{
	Context.modules.add_extension_listener ("/bonus/types/primitive", Lang.bind (this, this._add_primitive));
}

PrimitiveManager.prototype = {
	primitives: {},
	
	_add_primitive: function (pt, ext) {
		let obj = Context.modules.get_extension_object (ext);
		this.primitives[obj.name] = obj;
	},
	
};

