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

let testDef;
let testDefFile = testDir.get_child("unitDef.json");
if (testDefFile.query_exists(null)) {
	let [success, testDefStr, testDefLen, eTag] = testDefFile.load_contents(null);
	testDef = JSON.parse(testDefStr.toString());
} else {
	let fileList = getFilesInDir(testDir, /^test\w*\.js$/);
	for (let i = 0; i < fileList.length; i++)
		fileList[i] = fileList[i].substr(0, fileList[i].length);
	
	let srcDir = testDir.get_parent().get_child("src");
	testDef = {
		tests: fileList,
		searchPath: srcDir.get_path()
	};
}

let procArgs = ["gjs-console"];
for each (let searchPath in testDef.searchPath) {
	if (searchPath.charAt(0) !== '/')
		searchPath = testDir.resolve_relative_path(searchPath).get_path();
	procArgs.push("-I", searchPath);
}

let allPassed = true;

for each (let test in testDef.tests) {
	let testFileName = test + ".js";
	procArgs.push(testFileName);
	
	print("Running tests from file %s…".format(testFileName));
	
	let [success, stdout, stderr, status] = GLib.spawn_sync(
			testDir.get_path(),				// working directory
			procArgs,						// argv
			null,							// envp
			GLib.SpawnFlags.SEARCH_PATH,	// flags
			null,							// child setup function
			null							// user data
	);
	
	if (stdout && stdout.length > 0)
		print("The tests said:\n%s\n".format(stdout));
	if (stderr && stderr.length > 0)
		printerr("JSUnit said:\n%s".format(stderr));
	if (status !== 0) {
		allPassed = false;
		break;
	}
	
	print("**********");
	procArgs.pop();
}

log(allPassed ? "All tests passed!" : "Some tests failed! See output above.");

function getFilesInDir(dir, pattern) {
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

