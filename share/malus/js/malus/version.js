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

const _VERSION_FIELDS = ["major", "minor", "revision", "point"];

Version.prototype = {
	major: 0,
	minor: 0,
	revision: 0,
	point: 0,
	
	_init: function(str) {
		let fieldValues = str.split(".");
		if (fieldValues.length > 4)
			fieldValues.length = 4;
		for (let i = 0; i < fieldValues.length; i++) {
			let numVal = Number(fieldValues[i]);
			if (isNaN(numVal))
				break;
			this[_VERSION_FIELDS[i]] = numVal;
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
		for each (field in _VERSION_FIELDS) {
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
		
		if (this.point > 0)
			result = "%d.%d.%d.%d".format(this.major, this.minor, this.revision, this.point);
		else if (this.revision > 0)
			result = "%d.%d.%d".format(this.major, this.minor, this.revision);
		else
			result = "%d.%d".format(this.major, this.minor);
		
		return result;
	},
}

