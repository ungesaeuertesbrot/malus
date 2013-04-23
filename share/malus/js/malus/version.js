/**
 * Check if the version of MALUS required by the application is available.
 *
 * @arg {client_version} MALUS version required by the application.
 * @returns `true` if version is compatible.
 */
function check_client_version (client_version)
{
	return check_version (MALUS_VERSION, client_version);
}


/**
 * Check if an available version is sufficient to satisfy the needs of a
 * required version (i.e. available >= required).
 *
 * @arg {available} Available version.
 * @arg {required} Required version.
 */
function check_version (available, required)
{
	if (typeof (available) === "string")
		available = new Version (available);
	if (typeof (required) === "string")
		required = new Version (required);
	
	return (available.compare (required) >= 0);
}


/**
 * Create a Version object.
 *
 * @arg {str} string representation of the version:
 *            "[major].[minor].[point].[post_point]"
 */
function Version (str)
{
	this._init (str);
}

const _version_fields = ["major", "minor", "point", "post_point"];

Version.prototype = {
	major: 0,
	minor: 0,
	point: 0,
	post_point: 0,
	
	_init: function (str) {
		let field_values = str.split (".");
		if (field_values.length > 4)
			field_values.length = 4;
		for (let i = 0; i < field_values.length; i++) {
			let num_val = Number (field_values[i]);
			if (isNaN (num_val))
				break;
			this[_version_fields[i]] = num_val;
		}
	},
	
	
	/**
	 * Compare the present version to another one.
	 *
	 * @arg {other} The version to compare to, either a Version object or its
	 *              string representation.
	 * @returns 0 if both versions are equivalent, a positive number if the
	 *          present version is greater and a negative one if it is smaller
	 *          than the other version.
	 */
	compare: function (other) {
		if (typeof other !== "object")
			other = new Version (other.toString ());
		
		let delta = 0;
		for each (field in _version_fields) {
			delta = this[field] - other[field];
			if (delta !== 0)
				break;
		}

		return delta;
	},
	
	
	/**
	 * Creates a string representation of the Version object. This can be parsed
	 * again with the Version function.
	 *
	 * @returns A string representation of the Version object in the form of
	 *          "[major].[minor].[point].[post_point]".
	 */
	toString: function () {
		return "{0}.{1}.{2}.{3}".format (this.major, this.minor, this.point, this.post_point);
	}
}

