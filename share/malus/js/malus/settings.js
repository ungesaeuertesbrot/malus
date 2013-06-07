const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

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
function Settings(fn, context)
{
	this._init(fn, context);
}

Settings.prototype = {
	_init: function(fn, context) {
		if (!fn)
			fn = DEFAULT_SETTINGS_FILE;
		this._fn = fn;
		this._context = context;
		
		this._user = {};
		this._system = {};
		
		let cfgFile = Gio.file_new_for_path(GLib.build_filenamev([context["malus.paths"].config, fn]));
		if (cfgFile.query_exists(null)) {
			let cfg = GLib.file_get_contents(cfgFile.get_path());
			try {
				this._user = JSON.parse(cfg[1]);
			} catch (e) {
				logError(e, "Cannot load user settings");
			}
		}
	
		if (!context["malus.application"].info.hasGlobalSettings)
			return;
	
		let globalCfgDirs = GLib.get_system_config_dirs();
	
		for (let i = 0; i < globalCfgDirs.length; i++) {
			cfgFile = GLib.build_filenamev([globalCfgDirs[i], context["malus.application"].info.Name, fn]);
			cfgFile = Gio.file_new_for_path(cfgFile);
			if (!cfgFile.query_exists())
				continue;

			let cfg = GLib.file_get_contents(cfgFile.get_path());
			try {
				this._system = JSON.parse(cfg[1]);
				break;
			} catch (e) {
				logError(e, "Cannot load system settings");
			}
		}
	},
	
	
	/**
	 * Will save the user settings. Global settings are never saved and can only
	 * be modified manually by editing the global settings file. This function
	 * must be called at least once when the application exits or all changes to
	 * user settings are lost. MALUS takes care of this.
	 */
	save: function() {
		let hasSetting = false;
		for (let setting in this.user) {
			if (!this._user.hasOwnProperty(setting))
				continue;
			hasSetting = true;
			break;
		}
		
		if (hasSetting) {
			let cfgFile = GLib.build_filenamev([this._context["malus.paths"].config, this._fn]);
			GLib.file_set_contents(cfgFile, JSON.stringify(this._user, null, "\t"), -1);
		}
	},
	
	
	/**
	 * Will retrieve the value of a setting. Normally per-user settings will
	 * take precedent over system wide settings, except for protected settings.
	 *
	 * @arg {setting} Name of the setting.
	 * @arg {def} Default value to be returned if the setting does not exist yet.
	 * @returns The value of the setting or `def`.
	 */
	getValue: function(setting, def) {
		setting = setting.toString();
		let sys = this._system[setting],
			usr = this._user[setting];
		let sysType = typeof sys,
			usrType = typeof usr;
		if (sysType === "object") {
			if (sys.protect)
				return sys.value;
			else
				sys = sys.value;
		}
		if (usrType !== "undefined")
			return usr;
		else if (sysType !== "undefined")
			return sys;
		else
			return def;
	},
	
	
	/**
	 * Will set the value of a setting in the per-user settings if the setting
	 * is not protected.
	 *
	 * @arg {setting} Name of the setting.
	 * @arg {value} New value of the setting.
	 * @arg {reportError} If set to a value that will evaluate to `true` an
	 *                    Error object will be thrown if the setting cannot be
	 *                    set because it is protected. Otherwise such failure
	 *                    to set the value will go unnoticed.
	 */
	setValue: function(setting, value, reportError) {
		setting = setting.toString ();
		if (typeof this._system[setting] === "object" &&
			this._system[setting].protect) {
			if (reportError)
				throw new Error("Cannot set value for protected setting %s".format(setting));
			else
				return;
		}
		this._user[setting] = value;
	}
}

