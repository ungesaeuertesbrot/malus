const System = imports.system;
const JSUnit = imports.jsUnit;

const GLib = imports.gi.GLib;
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

var allPassed = true;

let testLib = testDir.get_child("units.lib");
if (testLib.query_exists(null)) {
	let [success, contents, contentLen, eTag] = testLib.load_contents(null);
	let testFiles = contents.toString().split('\n');
	for each (let fn in testFiles) {
		fn = fn.trim();
		if (fn.length === 0)
			continue;
		if (fn.charAt(0) === '#')
			continue;
		if (!runTests(fn)) {
			allPassed = false;
			break;
		}
	}
} else {
	let e = testDir.enumerate_children("standard::name,standard::type", Gio.FileQueryInfoFlags.NONE, null);

	let fileInfo;
	while ((fileInfo = e.next_file(null)) !== null) {
		let type = fileInfo.get_attribute_uint32("standard::type");
		if (type !== Gio.FileType.REGULAR)
			continue;
	
		let fn = fileInfo.get_attribute_byte_string("standard::name");
		if (!fn.match(/^test\w*\.js$/))
			continue;
		
		if (!runTests(fn)) {
			allPassed = false;
			break;
		}
	}

	e.close(null);
}

log(allPassed ? "All tests passed." : "Some tests failed!");


function runTests(fn) {
	print("Running tests from file %s…".format(fn));
	
	let [success, stdout, stderr, status] = GLib.spawn_sync(
			testDir.get_path(),									// working directory
			["gjs-console", "-I", malusPrefix.get_path(), fn],	// argv
			null,												// envp
			GLib.SpawnFlags.SEARCH_PATH,						// flags
			null,												// child setup function
			null												// user data
	);
	
	if (stdout && stdout.length > 0)
		print("The tests said:\n%s\n".format(stdout));
	if (stderr && stderr.length > 0)
		printerr("JSUnit said:\n%s".format(stderr));
	return status === 0;
}

