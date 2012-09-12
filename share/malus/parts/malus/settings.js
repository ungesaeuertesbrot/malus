const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const Context = imports.malus.context;

const DEFAULT_SETTINGS_FILE = "settings.js";


/**
 * Creates a new Settings object. If the application has set has_global_settings
 * to true, all directories in g_get_system_config_dirs will be searched for a
 * file named [APPLICATION NAME]/[fn] and the first hit will be used. In any
 * case g_get_user_config_dir/[APPLICATION NAME]/[fn] will be read for per user
 * settings if present. Both files contain a JSON-object where each field
 * represents one setting. There is one slight difference between the two,
 * though: In the system wide settings file a setting can be declared as being
 * protected from  per user changes by placing the setting inside an object with
 * a field "protect" carrying a value that will evaluate to true (such as
 * "true"). The actual value of the setting must then be placed in a field named
 * "value". Therefore, if you want a setting to consist of an  object this too
 * must be placed within the "value" field of a parent object.
 *
 * @arg {fn} Name of settings files. If this argument is omitted it will
 *           default to "settings.js".
 */
function Settings (fn)
{
	this._init (fn);
}

Settings.prototype = {
	_init: function (fn) {
		if (!fn)
			fn = DEFAULT_SETTINGS_FILE;
		this._fn = fn;
		
		let cfg_file = Gio.file_new_for_path (GLib.build_filenamev ([Context.paths.config, fn]));
		if (cfg_file.query_exists (null)) {
			let cfg = GLib.file_get_contents (cfg_file.get_path ());
			try {
				this._user = JSON.parse (cfg[1]);
			} catch (e) {
				logError (e, "Cannot load user settings");
			}
		}
	
		if (!Context.application.info.has_global_settings)
			return;
	
		let global_cfg_dirs = GLib.get_system_config_dirs ();
	
		for (let i = 0; i < global_cfg_dirs.length; i++) {
			cfg_file = GLib.build_filenamev ([global_cfg_dirs[i], Context.application.info.name, fn]);
			cfg_file = Gio.file_new_for_path (cfg_file);
			if (!cfg_file.query_exists ())
				continue;

			let cfg = GLib.file_get_contents (cfg_file.get_path ());
			try {
				this._system = JSON.parse (cfg[1]);
				break;
			} catch (e) {
				logError (e, "Cannot load system settings");
			}
		}
	},
	
	
	/**
	 * Will save the user settings. Global settings are never saved and can only
	 * be modified manually by editing the global settings file. This function
	 * must be called at least once when the application exits or all changes to
	 * user settings are lost. MALUS takes care of this.
	 */
	save: function () {
		let has_setting = false;
		for (let setting in this.user) {
			if (!this._user.hasOwnProperty (setting))
				continue;
			has_setting = true;
			break;
		}
		
		if (has_setting) {
			let cfg_file = GLib.build_filenamev ([Context.paths.config, this._fn]);
			GLib.file_set_contents (cfg_file, JSON.stringify (this._user, null, "\t"), -1);
		}
	},
	
	
	/**
	 * Will retrieve the value of a setting. Normally per-user settings will
	 * take precedent over system wide settings, except for protected settings.
	 *
	 * @ arg {setting} Name of the setting.
	 * @returns The value of the setting or `undefined` if no such setting
	 *          exists.
	 */
	get_value: function (setting) {
		setting = setting.toString ();
		let sys = this._system[setting],
			usr = this._user[setting];
		let sys_type = typeof sys,
			usr_type = typeof usr;
		if (sys_type === "object") {
			if (sys.protect)
				return sys.value;
			else
				sys = sys.value;
		}
		if (usr_type !== "undefined")
			return usr;
		else
			return sys;
	},
	
	
	/**
	 * Will set the value of a setting in the per-user settings if the setting
	 * is not protected.
	 *
	 * @arg {setting} Name of the setting.
	 * @arg {value} New value of the setting.
	 * @arg {report_error} If set to a value that will evaluate to `true` an
	 *                     Error object will be thrown if the setting cannot be
	 *                     set because it is protected. Otherwise such failure
	 *                     to set the value will go unnoticed.
	 */
	set_value: function (setting, value, report_error) {
		setting = setting.toString ();
		if (typeof this._system[setting] === "object" &&
			this._system[setting].protect) {
			if (report_error)
				throw new Error ("Cannot set value for protected setting " + setting);
			else
				return;
		}
		this._user[setting] = value;
	}
}

