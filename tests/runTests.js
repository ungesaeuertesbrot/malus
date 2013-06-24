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

const DBusObject = {
	get TestRootDir() {
		return testDir.get_path();
	}
};

const DBusInterface =
'<interface name="net.schoel.malus.Test">\
	<property name="TestRootDir" type="s" access="read" />\
</interface>';

let dbusWrappedObj = Gio.DBusExportedObject.wrapJSObject(DBusInterface, DBusObject);
dbusWrappedObj.export(Gio.DBus.session, "/net/schoel/malus/Test");
Gio.DBus.session.own_name("net.schoel.malus.Test", Gio.BusNameOwnerFlags.NONE, null, null);

let children = [];
let allPassed = true;

runNextTest();

Mainloop.run(MAINLOOP_ID);

log(allPassed ? "All tests passed!" : "Some tests failed! See output above.");

function runNextTest() {
	let test = testDef.tests.shift();
	if (test === undefined) {
		Mainloop.quit(MAINLOOP_ID);
		return;
	}
	let testFileName = test + ".js";
	let args = procArgs.slice(0);
	args.push(testFileName);
	
	print("Running tests from file %s…".format(testFileName));
	
	let success, childPid, stdin, stdout, stderr;
	try {
		[success, childPid, stdin, stdout, stderr] = GLib.spawn_async_with_pipes(
				testDir.get_path(),						// working directory
				args,									// argv
				null,									// envp
				GLib.SpawnFlags.SEARCH_PATH
				| GLib.SpawnFlags.DO_NOT_REAP_CHILD,	// flags
				null									// child setup function
		);
	} catch (e) {
		logError(e, "Could not start test '%s'".format(testFileName));
		Mainloop.quit(MAINLOOP_ID);
		return;
	}
	
	let child = {
		pid: childPid,
		stdout: stdout,
		stderr:stderr
	};
	
	children.push(child);
	GLib.child_watch_add(GLib.PRIORITY_DEFAULT_IDLE, childPid, onChildFinished);
}

function onChildFinished(pid, status) {
	var child;
	for (let i = 0; i < children.length; i++) {
		let c = children[i];
		if (c.pid === pid) {
			child = c;
			children.splice(i, 1);
			break;
		}
	}
	
	let stdoutChannel = GLib.IOChannel.unix_new(child.stdout);
	let [outStatus, outStr] = stdoutChannel.read_to_end();
	stdoutChannel.shutdown(false);
	if (outStr.length > 0)
		print("The tests said:\n%s\n".format(outStr));
	let stderrChannel = GLib.IOChannel.unix_new(child.stderr);
	let [errStatus, errStr] = stderrChannel.read_to_end();
	stderrChannel.shutdown(false);
	if (errStr.length > 0)
		print("JSUnit said:\n%s\n".format(errStr));

	GLib.spawn_close_pid(pid);
	
	print("**********");

	try {
		GLib.spawn_check_exit_status(status);
	} catch (e) {
		allPassed = false;
	}
	
	runNextTest();
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

