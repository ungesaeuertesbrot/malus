const DBus = imports.dbus;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

const Context = imports.malus.context;


function Root ()
{
	Context.modules.add_extension_listener ("/bonus/type_system", function (pt, ext) {
		Context.types = Context.modules.get_extension_object (ext);
	});
	if (typeof Context.types == "undefined")
		throw new Error ("No type system found");
}

Root.prototype = {
	
	run: function () {
		for (let type in Context.types.primitives.primitives)
			print (JSON.stringify (type));
	}
};

