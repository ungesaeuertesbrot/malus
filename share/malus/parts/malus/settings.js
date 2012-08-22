const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const Context = imports.malus.context;

const SETTINGS_FILE = "settings.js";

function Settings ()
{
	let cfg_file = Gio.file_new_for_path (GLib.build_filenamev ([Context.paths.config, SETTINGS_FILE]));
	if (cfg_file.query_exists (null)) {
		let cfg = GLib.file_get_contents (cfg_file.get_path ());
		try {
			this.user = JSON.parse (cfg[1]);
		} catch (e) {
		}
	}
	
	if (!Context.application.info.has_global_settings)
		return;
	
	let global_cfg_dirs = GLib.get_system_config_dirs ();
	
	for (let i = 0; i < global_cfg_dirs.length; i++) {
		cfg_file = GLib.build_filenamev ([global_cfg_dirs[i], Context.application.info.name, SETTINGS_FILE]);
		cfg_file = Gio.file_new_for_path (cfg_file);
		if (!cfg_file.query_exists ())
			continue;

		let cfg = GLib.file_get_contents (cfg_file.get_path ());
		try {
			this.global = JSON.parse (cfg[1]);
			break;
		} catch (e) {
		}
	}
}

Settings.prototype = {
	user: {},
	global: {},
	
	/**
	 * Will save the user settings. Global settings are never saved and can only
	 * be modified manually by editing the global settings file.
	 */
	save: function () {
		let has_setting = false;
		for (let setting in this.user) {
			if (!this.user.hasOwnProperty (setting))
				continue;
			has_setting = true;
			break;
		}
		
		if (has_setting) {
			let cfg_file = GLib.build_filenamev ([Context.paths.config, SETTINGS_FILE]);
			GLib.file_set_contents (cfg_file, JSON.stringify (this.user, null, "\t"), -1);
		}
	}
}

