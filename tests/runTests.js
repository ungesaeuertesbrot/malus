const System = imports.system;
const JSUnit = imports.jsUnit;
const Mainloop = imports.mainloop;

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const MAINLOOP_ID = "malusTestLoop";

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

if (testDef.tests.length === 0) {
	log("No tests defined. Aborting.");
	System.exit(-1);
}

let procArgs = ["gjs-console"];
for each (let searchPath in testDef.searchPath) {
	if (searchPath.charAt(0) !== '/')
		searchPath = testDir.resolve_relative_path(searchPath).get_path();
	procArgs.push("-I", searchPath);
}

let children = [];
let allPassed = true;

runNextTest();

Mainloop.run(MAINLOOP_ID);

log(allPassed ? "All tests passed!" : "Some tests failed! See output above.");

function runNextTest() {
	let test = testDef.tests.shift();
	if (test === undefined)
		return;
	let testFileName = test + ".js";
	let args = procArgs.slice(0);
	args.push(testFileName);
	
	print("Running tests from file %s…".format(testFileName));
	
	let success, childPid, stdin, stdout, stderr;
	try {
		[success, childPid, stdin, stdout, stderr] = GLib.spawn_async_with_pipes(
				testDir.get_path(),				// working directory
				procArgs,						// argv
				null,							// envp
				GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD,	// flags
				null,							// child setup function
				null							// user data
		);
	} catch (e) {
		logError(e, "Could not start test '%s'".format(testFileName));
		Mainloop.quit(MAINLOOP_ID);
		return;
	}
	
	log("Started child process with id %d".format(childPid));
	
	let child = {
		pid: childPid,
		stdout: stdout,
		stderr:stderr
	};
	
	children.push(child);
	GLib.child_watch_add(GLib.PRIORITY_DEFAULT, childPid, onChildFinished, null);
}

function onChildFinished(pid, status) {
	GLib.spawn_close_pid(pid);
	print("Finished");
	var child;
	for (let i = 0; i < children.length; i++) {
		let c = children[i];
		if (child.pid === pid) {
			child = c;
			children.splice(i, 1);
			if (children.length === 0)
				Mainloop.quit(MAINLOOP_ID);
			break;
		}
	}
	
	let stdoutStream = Gio.UnixInputStream.new(child.stdout, true);
	let stdoutReader = Gio.DataInputStream.new(stdoutStream);
	let [stdout, stdoutLen] = stdoutReader.read_upto("", 0, null);
	if (stdoutLen > 0)
		print("The tests said:\n%s\n".format(stdout));
	let stderrStream = Gio.UnixInputStream.new(child.stderr, true);
	let stderrReader = Gio.DataInputStream.new(stderrStream);
	let [stderr, stderrLen] = stderrReader.read_upto("", 0, null);
	if (stderrLen > 0)
		printerr("JSUnit said:\n%s".format(stderr));
	
	print("**********");

	try {
		if (!GLib.spawn_check_exit_status(pid))
			throw "";
	} catch (e) {
		allPassed = false;
	}
}

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

