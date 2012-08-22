const MALUS_VERSION = "0.1";

function check_client_version (client_version)
{
	return check_version (MALUS_VERSION, client_version);
}

function check_version (available, required)
{
	if (typeof (available) == "string")
		available = new Version (available);
	if (typeof (required) == "string")
		required = new Version (required);
	
	return (available.major >= required.major &&
		available.minor >= required.minor &&
		available.point >= required.point &&
		available.post_point >= required.post_point);
}

function Version (str)
{
	const fields = ["major", "minor", "point", "post_point"];
	var field_id = 0;
	
	var field_val = 0;
	for (var i = 0; i < str.length; i++) {
		var chr = str.charAt (i);
		if (chr == '.') {
			this[fields[field_id]] = field_val;
			field_id++;
			if (field_id <= 2)
				continue;
			i++;
			break;
		}
		chr = Number (chr);
		if (isNaN (chr)) {
			this[fields[field_id]] = field_val;
			break;
		}
		field_val *= 10;
		field_val += chr;
	}
	
	if (i < str.length)
		this.post_point = str.substr (i);
}

Version.prototype = {
	major: 0,
	minor: 0,
	point: 0,
	post_point: ""
}

