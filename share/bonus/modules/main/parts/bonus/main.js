const DBus = imports.dbus;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

const DBusPath = "/net/shoel/Bonus";
var DBusIFace = {
	name: "net.schoel.ponus",
	
	methods: [
		{name: "quit",
		 inSignature: "",
		 outSignature: ""}
	],
	
	signals: []
};

function RootRemote ()
{
	this._init ();
}

RootRemote.prototype = {
	_init: function () {
		DBus.session.proxifyObject (this, DBusIFace.name, DBusPath);
	}
};

DBus.proxifyPrototype (RootRemote.prototype, DBusIFace);

function Root ()
{
}

Root.prototype = {
	_init: function () {
		print ("Trying to acquire name");
		var oa = Lang.bind (this, this._onNameAcquired);
		var ona = Lang.bind (this, this._onNameNotAcquired);
		var ret = DBus.session.acquire_name (DBusIFace.name, DBus.SINGLE_INSTANCE, oa, ona);
		print ("Returned " + ret);
	},
	
	_onNameAcquired: function () {
		print ("Acquired name");
		DBus.session.exportObject (DBusPath, this);
		print ("Object exported");
		while (!this.quit_now);
	},
	
	_onNameNotAcquired: function () {
		print ("Name not acquired");
		var remote = new RootRemote ();
		print ("Stopping remote");
		remote.quitRemote ();
	},
	
	run: function () {
		this._init ();
	},
	
	quit: function () {
		this.quit_now = true;
	}
};

