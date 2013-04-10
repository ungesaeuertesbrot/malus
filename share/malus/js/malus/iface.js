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
function implements_interface (obj, iface)
{
	for (let member in iface) {
		let condition = iface[member];
		if (typeof condition == "string")
			condition = {type: condition};
		else if (typeof condition.type != "string")
			continue;

		let is_type = typeof obj[member];

		switch (condition.type) {
		case "array":
			if (!((is_type == "object") && (obj[member].isArray ())))
				return false;
			break;

		case "gsignal": {
			let GObj = imports.gi.GObject;	// do not import this where it is
											// stricly necessary to avoid
											// loading GObject in non-GObject
											// apps.
			return GObj.signal_lookup (member, obj.constructor.$gtype) !== 0;
		}
		
		default:
			// Only test presence of field, no matter what type
			if (condition.type.length === 0 && is_type !== "undefined")
				break;
			if (is_type !== condition.type)
				return false
		}
	}
	
	return true;
}

