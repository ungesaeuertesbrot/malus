const GLib = imports.gi.GLib;


/**
 * Constructor for an application object. This is simply a container for basic
 * information on the application being run and an instance of it will be
 * created by MALUS.
 *
 * @arg {app_base_path} Path to the directory the application's info.js file
 *                      resides in.
 */
function Application (app_base_path, context)
{
	this._init(app_base_path, context);
}

Application.prototype = {
	_init: function(app_base_path, context) {
		let info_file_path = GLib.build_filenamev ([app_base_path, "info.js"]);
		let info = GLib.file_get_contents (info_file_path);
		this.info = JSON.parse (info[1]);
		this.base_path = app_base_path;

		if (!context.version.check_client_version (this.info.malus_version))
			throw new Error ("Incompatible malus version (requested %s, is %s)".format(this.info.malus_version, context.version.toString()));
		
		GLib.set_application_name(this.info.title);
	},
	
	/**
	 * Will hold the information from the application's info.js file. See the
	 * README file for details.
	 */
	info: {},
	
	/**
	 * Path to the directory the application's info.js resides in.
	 */
	base_path: "",
}

