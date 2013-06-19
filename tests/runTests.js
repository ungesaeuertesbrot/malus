const System = imports.system;
const JSUnit = imports.jsUnit;

const Gio = imports.gi.Gio;

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
let rootDir = testDir.get_parent();
let malusPrefix = rootDir.resolve_relative_path("share/malus/js");
if (!malusPrefix.query_exists(null)) {
	printerr("Could not find malus (expected at '%s')".format(malusPrefix.get_path()));
	System.exit();
}

imports.searchPath.push(malusPrefix.get_path());

let e = testDir.enumerate_children("standard::name,standard::type", Gio.FileQueryInfoFlags.NONE, null);

var fileInfo;
while ((fileInfo = e.next_file(null)) !== null) {
	let type = fileInfo.get_attribute_uint32("standard::type");
	if (type !== Gio.FileType.REGULAR)
		continue;
	
	let fn = fileInfo.get_attribute_byte_string("standard::name");
	if (fn.substr(0, 4) !== "test")
		continue;
	if (fn.substr(fn.length - 3) !== ".js")
		continue;
	
	let testFile = testDir.get_child(fn);
	let [result, js, jsLen, eTag] = testFile.load_contents(null);
	eval(js);
//	print("running file %s".format(testFile.get_path()));
//	imports[testFile.get_path()];
}

e.close(null);

