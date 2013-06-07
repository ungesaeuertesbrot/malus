#!/usr/bin/gjs

// TODO:
//   * Use Injector within malus itself
//   * Disabling of extensions
//   * Dependency checks for modules
//   * Add ModuleProvider for gars (<jar)

"use strict";

const MALUS_NAME = "malus";
const MALUS_VERSION = "0.3";

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const cmdlineArgs = {
	//'-': function () true,
	'n': function(name) {appName = name;},
	'm': function(prefix) {malusPrefix = prefix;},
	'a': function(prefix) {appPrefix = prefix;}
};


var malusPrefix;
var appPrefix;
var appName;

for (let i = 0; i < ARGV.length; ) {
	if (ARGV[i][0] != '-') { i++; continue; }
	if (!cmdlineArgs.hasOwnProperty(ARGV[i][1])) { i++; continue; }
	let func = cmdlineArgs[ARGV[i][1]];
	let len = func.length + 1;	// includes original argument
	let args = ARGV.splice(i, len);
	args.shift();
	if (func.apply(null, args))
		break;
}


if (!malusPrefix) {
	malusPrefix = GLib.getenv("MALUS_PREFIX");
	if (!malusPrefix) {
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
		// The script is located at MALUS_PREFIX/share/malus/js/malus/malus.js,
		// so we need to go up five steps in order to reach the prefix.
		let prefixFile = scriptFile.get_parent().get_parent().get_parent().get_parent().get_parent();
		malusPrefix = prefixFile.get_path();
		log("No MALUS prefix defined. Falling back to default of " + malusPrefix);
	}
}
if (!appPrefix) {
	appPrefix = GLib.getenv("MALUS_APP_PREFIX");
	if (!appPrefix) {
		appPrefix = malusPrefix;
		log("No application prefix defined. Defaulting to MALUS prefix.");
	}
}
if (!appName) {
	appName = GLib.getenv("MALUS_APP_NAME");
	if (!appName)
		throw new Error("No application defined");
}

GLib.set_prgname(appName);


var binDir = GLib.build_filenamev([appPrefix, "bin"]);
var malusShare = GLib.build_filenamev([malusPrefix, "share", MALUS_NAME]);
var appShare = GLib.build_filenamev([appPrefix, "share", appName]);

imports.searchPath.unshift(GLib.build_filenamev ([malusShare, "js"]));
// Imports search path is set up. Import the following once so it can apply its
// patches.
imports.malus.patches;


const Context = {};
Context["malus.argv"] = ARGV;
Context["malus.appName"] = appName;

const Version = imports.malus.version;
Context["malus.version"] = new Version.Version(MALUS_VERSION);

let paths = {};
paths.bin = binDir;
paths.malusPrefix = malusPrefix;
paths.malusShare = malusShare;
paths.prefix = appPrefix;
paths.share = appShare;

paths.userShare = GLib.build_filenamev([GLib.get_user_data_dir(), appName]);
paths.config = GLib.build_filenamev([GLib.get_user_config_dir(), appName]);

Context["malus.paths"] = paths;

var gfile = Gio.file_new_for_path(Context["malus.paths"].userShare);
if (!gfile.query_exists(null)) {
	gfile.make_directory_with_parents(null, null);
	log("Created directory for user shared data at %s".format(gfile.get_path()));
}
gfile = Gio.file_new_for_path(Context["malus.paths"].config);
if (!gfile.query_exists(null)) {
	gfile.make_directory_with_parents(null, null);
	log("Created directory for user configuration data at %s".format(gfile.get_path()));
}

const Injection = imports.malus.injection;
Context["malus.injector"] = new Injection.Injector(Context);

const Application = imports.malus.application;
Context["malus.application"] = new Application.Application(Context);

const Settings = imports.malus.settings;
Context["malus.settings"] = new Settings.Settings(undefined, Context);

const Modules = imports.malus.modules;
Context["malus.modules"] = new Modules.ModuleManager(Context);

const Extensions = imports.malus.extensions;
Context["malus.extensions"] = new Extensions.ExtensionManager(Context);


Context["malus.extensions"].addExtensionPoint("/malus/root", {
	IsSingular: true,
	TestArgs: [{run: "function"}],
});
Context["malus.extensions"].addExtensionPoint("/malus/shutdown-notification", {
	TestArgs: [{shutdown: "function"}],
});


let rootExt = Context["malus.extensions"].getExtensions("/malus/root");
if (rootExt.length !== 1)
	throw new Error("Exactly one root extension is required but found %d".format(rootExt.length));
let extObj = Context["malus.extensions"].getExtensionObject(rootExt[0]);
extObj.run(ARGV);

let shutdownHandlers = Context["malus.extensions"].getExtensions("/malus/shutdown-notification");
for each (let handler in shutdownHandlers) {
	let obj = Context["malus.extensions"].getExtensionObject(handler);
	obj.shutdown();
}

Context["malus.settings"].save();

