/**
 * Create a Version object.
 *
 * @arg {str} string representation of the version:
 *            "[major].[minor].[point].[post_point]"
 */
function Version(str)
{
	this._init(str);
}

const _version_fields = ["major", "minor", "point", "post_point"];

Version.prototype = {
	major: 0,
	minor: 0,
	point: 0,
	post_point: 0,
	
	_init: function(str) {
		let field_values = str.split(".");
		if (field_values.length > 4)
			field_values.length = 4;
		for (let i = 0; i < field_values.length; i++) {
			let num_val = Number(field_values[i]);
			if (isNaN(num_val))
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
	compare: function(other) {
		if (typeof other !== "object")
			other = new Version(other.toString());
		
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
		let result;
		
		if (this.post_point > 0)
			result = "%d.%d.%d.%d".format(this.major, this.minor, this.point, this.post_point);
		else if (this.point > 0)
			result = "%d.%d.%d".format(this.major, this.minor, this.point);
		else
			result = "%d.%d".format(this.major, this.minor);
		
		return result;
	},
}

