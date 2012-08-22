const Primitives = imports.bonus.types.primitive_manager;

function System ()
{
	this.primitives = new Primitives.PrimitiveManager ();
}

System.prototype = {
	primitives: {}
};

