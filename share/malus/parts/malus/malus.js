#!/usr/bin/gjs

"use strict";

const MALUS_NAME = "malus";

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const cmd_line_args = {
	'-': function () true,
	'n': function (name) {app_name = name;},
	'm': function (prefix) {malus_prefix = prefix;},
	'a': function (prefix) {app_prefix = prefix;}
};


var malus_prefix;
var app_prefix;
var app_name;

for (let i = 0; i < ARGV.length; ) {
	if (ARGV[i][0] != '-') { i++; continue; }
	if (!cmd_line_args.hasOwnProperty (ARGV[i][1])) { i++; continue; }
	let func = cmd_line_args[ARGV[i][1]];
	ARGV.splice (i, 1);
	let args = [];
	let len = func.length;
	while (len--) {
		args.push (ARGV[i]);
		ARGV.splice (i, 1);
	}
	if (func.apply (null, args))
		break;
}


if (!malus_prefix) {
	malus_prefix = GLib.getenv ("MALUS_PREFIX");
	if (!malus_prefix) {
		malus_prefix = "/usr/local";
		log ("No MALUS prefix defined. Falling back to default of " + malus_prefix);
	}
}
if (!app_prefix) {
	app_prefix = GLib.getenv ("MALUS_APP_PREFIX");
	if (!app_prefix)
		app_prefix = malus_prefix;
}
if (!app_name) {
	app_name = GLib.getenv ("MALUS_APP_NAME");
	if (!app_name)
		throw new Error ("No application defined");
}

GLib.set_prgname (app_name);

var bin_dir = GLib.build_filenamev ([app_prefix, "bin"]);
var malus_share = GLib.build_filenamev ([malus_prefix, "share", MALUS_NAME]);
var app_share = GLib.build_filenamev ([app_prefix, "share", app_name]);

imports.searchPath.unshift (GLib.build_filenamev ([malus_share, "parts"]));
// Imports search path is set up. Import the following once so it can apply its
// patches.
imports.malus.patches;
const Context = imports.malus.context;

Context.paths.bin = bin_dir;
Context.paths.malus_prefix = malus_prefix;
Context.paths.malus_share = malus_share;
Context.paths.prefix = app_prefix;
Context.paths.share = app_share;

Context.paths.user_share = GLib.build_filenamev ([GLib.get_user_data_dir (), app_name]);
Context.paths.config = GLib.build_filenamev ([GLib.get_user_config_dir (), app_name]);

var gfile = Gio.file_new_for_path (Context.paths.user_share);
if (!gfile.query_exists (null))
	gfile.make_directory_with_parents (null, null);
gfile = Gio.file_new_for_path (Context.paths.config);
if (!gfile.query_exists (null))
	gfile.make_directory_with_parents (null, null);

const Application = imports.malus.application;
Context.application = new Application.Application (Context.paths.share);

const Settings = imports.malus.settings;
Context.settings = new Settings.Settings ();

const Modules = imports.malus.module_manager;
Context.modules = new Modules.ModuleManager ();
Context.modules.add_extension_point ("/", {
	is_singular: true,
	test_func: function (obj) { return imports.malus.iface.implements_interface (obj, {run: "function"}); }
});
//Context.modules.update ();
Context.modules.add_extension_listener ("/", function (pt, ext) {
	Context.modules.get_extension_object (ext).run ();
});

Context.settings.save ();

