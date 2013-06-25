const Gio = imports.gi.Gio;


const UNIT_DEFINITION_FILE = "unitDef.json";
const DBUS_INTERFACE=
'<interface name="net.schoel.malus.Test">\
	<property name="TestRootDir" type="s" access="readwrite" />\
</interface>';
const DBUS_PATH = "/net/schoel/malus/Test";
const DBUS_NAME = "net.schoel.malus.Test";


function TestAssemblyLine() {
	this._init();
}

TestAssemblyLine.prototype = {
	_init: function() {
	
	},
	
	set testDefinition(def) {
		this._def = def;
	},
	
	get testDefinition() {
		return this._def;
	},
	
	next: function() {
	
	},
};


function TestConductor(dir) {
	this._init(dir);
}

TestConductor.prototype = {
	_init: function(dir) {
		// Must exist before setting the root directory
		this._assemblyLine = new TestAssemblyLine();

		if (typeof dir === "string")
			this.TestRootDir = dir;
		else
			this.rootDir = dir;
		
		this._dbusWrapper = Gio.DBusExportedObject.wrapJSObject(DBUS_INTERFACE, this);
		this._dbusWrapper.export(Gio.DBus.session, DBUS_PATH);
	},
	
	set TestRootDir(dir) {
		this.rootDir = Gio.File.new_for_path(dir);
	},
	
	get TestRootDir() {
		return this.rootDir.get_path();
	},
	
	set rootDir(dir) {
		this._rootDir = dir;

		let testDef;
		let testDefFile = dir.get_child(UNIT_DEFINITION_FILE);
		if (testDefFile.query_exists(null)) {
			let [success, testDefStr, testDefLen, eTag] = testDefFile.load_contents(null);
			testDef = JSON.parse(testDefStr.toString());
		} else {
			let fileList = _getFilesInDir(dir, /^test\w*\.js$/);
			for (let i = 0; i < fileList.length; i++)
				fileList[i] = fileList[i].substring(4, fileList[i].length);
	
			let srcDir = dir.get_parent().get_child("src");
			testDef = {
				tests: fileList,
				searchPath: srcDir.get_path()
			};
		}

		if (testDef.tests.length === 0)
			throw new Error("No tests defined. Aborting.");
		
		this._assemblyLine.testDefinition = testDef;
	},
	
	get rootDir() {
		return this._rootDir;
	},
	
	runDBus: function() {
		Gio.DBus.session.own_name(DBUS_NAME, Gio.BusNameOwnerFlags, null, null, null);
	},
	
	run: function() {
	
	},
};


function _getFilesInDir(dir, pattern) {
	let fileList = [];
	
	let e = dir.enumerate_children("standard::name,standard::type", Gio.FileQueryInfoFlags.NONE, null);

	let fileInfo;
	while ((fileInfo = e.next_file(null)) !== null) {
		let type = fileInfo.get_attribute_uint32("standard::type");
		if (type !== Gio.FileType.REGULAR)
			continue;
	
		let fn = fileInfo.get_attribute_byte_string("standard::name");
		if (pattern && !fn.match(pattern))
			continue;
		
		fileList.push(fn);
	}
	
	e.close(null);
	
	return fileList;
}




String.prototype.format = imports.format.format;

// extract default from current script's path. Logic stolen from
// gnome shell (misc/extensionUtils.js).
let stackLine = (new Error()).stack.split('\n')[0];
if (!stackLine)
	throw new Error('Could not find current file');

// The stack line is like:
//   init([object Object])@/home/user/data/gnome-shell/extensions/u@u.id/prefs.js:8
//
// In the case that we're importing from
// module scope, the first field is blank:
//   @/home/user/data/gnome-shell/extensions/u@u.id/prefs.js:8
let match = /@(.+):\d+/.exec(stackLine);
if (!match)
	throw new Error('Could not find current file');

let scriptFile = Gio.File.new_for_path(match[1]);
let testDir = scriptFile.get_parent();

let conductor = new TestConductor(testDir);
conductor.runDBus();
conductor.run();

