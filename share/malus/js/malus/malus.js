#!/usr/bin/gjs

"use strict";

const MALUS_NAME = "malus";
const MALUS_VERSION = "0.2";

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const cmd_line_args = {
	//'-': function () true,
	'n': function(name) {app_name = name;},
	'm': function(prefix) {malus_prefix = prefix;},
	'a': function(prefix) {app_prefix = prefix;}
};


var malus_prefix;
var app_prefix;
var app_name;

for (let i = 0; i < ARGV.length; ) {
	if (ARGV[i][0] != '-') { i++; continue; }
	if (!cmd_line_args.hasOwnProperty(ARGV[i][1])) { i++; continue; }
	let func = cmd_line_args[ARGV[i][1]];
	let len = func.length + 1;	// includes original argument
	let args = ARGV.slice(i + 1, i + len);
	ARGV.splice(i, len);
	if (func.apply(null, args))
		break;
}


if (!malus_prefix) {
	malus_prefix = GLib.getenv("MALUS_PREFIX");
	if (!malus_prefix) {
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

		let script_file = Gio.File.new_for_path(match[1]);
		// The script is located at MALUS_PREFIX/share/malus/js/malus/malus.js,
		// so we need to go up five steps in order to reach the prefix.
		let prefix_file = script_file.get_parent().get_parent().get_parent().get_parent().get_parent();
		malus_prefix = prefix_file.get_path();
		log("No MALUS prefix defined. Falling back to default of " + malus_prefix);
	}
}
if (!app_prefix) {
	app_prefix = GLib.getenv("MALUS_APP_PREFIX");
	if (!app_prefix) {
		app_prefix = malus_prefix;
		log("No application prefix defined. Defaulting to MALUS prefix.");
	}
}
if (!app_name) {
	app_name = GLib.getenv("MALUS_APP_NAME");
	if (!app_name)
		throw new Error("No application defined");
}

GLib.set_prgname(app_name);

var bin_dir = GLib.build_filenamev([app_prefix, "bin"]);
var malus_share = GLib.build_filenamev([malus_prefix, "share", MALUS_NAME]);
var app_share = GLib.build_filenamev([app_prefix, "share", app_name]);

imports.searchPath.unshift(GLib.build_filenamev ([malus_share, "js"]));
// Imports search path is set up. Import the following once so it can apply its
// patches.
imports.malus.patches;
const Context = imports.malus.context;

const Version = imports.malus.version;
Context.version = new Version.Version(MALUS_VERSION);

Context.paths.bin = bin_dir;
Context.paths.malus_prefix = malus_prefix;
Context.paths.malus_share = malus_share;
Context.paths.prefix = app_prefix;
Context.paths.share = app_share;

Context.paths.user_share = GLib.build_filenamev([GLib.get_user_data_dir(), app_name]);
Context.paths.config = GLib.build_filenamev([GLib.get_user_config_dir(), app_name]);

var gfile = Gio.file_new_for_path(Context.paths.user_share);
if (!gfile.query_exists(null)) {
	gfile.make_directory_with_parents(null, null);
	log("Created directory for user shared data at %s".format(gfile.get_path()));
}
gfile = Gio.file_new_for_path(Context.paths.config);
if (!gfile.query_exists(null)) {
	gfile.make_directory_with_parents(null, null);
	log("Created directory for user configuration data at %s".format(gfile.get_path()));
}

const Application = imports.malus.application;
Context.application = new Application.Application(Context);

const Settings = imports.malus.settings;
Context.settings = new Settings.Settings(undefined, Context);

const Modules = imports.malus.module_manager;
Context.modules = new Modules.ModuleManager(Context);
Context.modules.add_extension_point("/", {
	is_singular: true,
	test_func: function(obj) { return imports.malus.iface.implements_interface(obj, {run: "function"}); }
});
//Context.modules.update ();
Context.modules.add_extension_listener("/", function(pt, ext) {
	Context.modules.get_extension_object(ext).run(ARGV);
});

Context.settings.save();

