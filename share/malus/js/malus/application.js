const GLib = imports.gi.GLib;


/**
 * Constructor for an application object. This is simply a container for basic
 * information on the application being run and an instance of it will be
 * created by MALUS.
 *
 * @arg {app_base_path} Path to the directory the application's info.js file
 *                      resides in.
 */
function Application (context)
{
	this._init(context);
}

Application.prototype = {
	_init: function(context) {
		let infoFilePath = GLib.build_filenamev ([context["malus.paths"].share, "info.js"]);
		let info = GLib.file_get_contents (infoFilePath);
		this.info = JSON.parse (info[1]);

		if (context["malus.version"].compare(this.info.MalusVersion) < 0)
			throw new Error("Incompatible malus version (requested %s, is %s)".format(this.info.MalusVersion, context["malus.version"].toString()));
		
		GLib.set_application_name(this.info.Title);
	},
	
	/**
	 * Will hold the information from the application's info.js file. See the
	 * README file for details.
	 */
	info: {},
}

