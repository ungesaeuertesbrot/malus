/**
 * Test wheather an object instance fulfills the requirements set by a specified
 * interface. The interface is an object where each field represents a required
 * field in the object and the string value of that field represents the type of
 * the corresponding field in the object. Legal values include all JavaScript
 * types, an empty string (which simply test for the existence of the field and
 * disregards its type), "array" which test with isArray and "event" which
 * designates an event defined through the MALUS event mechanism.
 *
 * EXAMPLE:
 *     {
 *         "foo": "function",
 *         "bar": "string",
 *         "baz": ""         // must exist but can be of any type
 *     }
 *
 * @arg {obj}   The object instance to test.
 * @arg {iface} An object representing the interface to test against.
 * @returns     true if the object instance conforms to the interface.
 */
function implementsInterface(obj, iface)
{
	for (let member in iface) {
		let condition = iface[member];
		if (typeof condition == "string")
			condition = {type: condition};
		else if (typeof condition.type != "string")
			continue;

		let isType = typeof obj[member];

		switch (condition.type) {
		case "array":
			if (!((isType == "object") && (Array.isArray(obj[member]))))
				return false;
			break;

		case "gsignal": {
			let GObj = imports.gi.GObject;	// Only create module if necessary
			if (GObj.signal_lookup(member, obj.constructor.$gtype) === 0)
				return false;
			break;
		}
		
		case "undefined":
			if (member in obj)
				return false;
			break;
		
		default:
			// Only test presence of field, no matter what type
			if (condition.type.length === 0 && member in obj)
				break;
			if (isType !== condition.type || obj[member] === null)
				return false
		}
	}
	
	return true;
}

