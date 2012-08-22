const GLib = imports.gi.GLib;
const Ver = imports.malus.version;

function Application (app_base_path)
{
	let info_file_path = GLib.build_filenamev ([app_base_path, "info.js"]);
	let info = GLib.file_get_contents (info_file_path);
	this.info = JSON.parse (info[1]);
	this.base_path = app_base_path;

	if (!Ver.check_client_version (this.info.malus_version))
		throw new Error ("Incompatible malus version");
}

Application.prototype = {
}

