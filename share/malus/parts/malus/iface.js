/**
 * Test wheather an object instance fulfills the requirements set by a specified
 * interface. The interface is an object where each field represents a required
 * field in the object and the string value of that field represents the type of
 * the corresponding field in the object. Legal values include all JavaScript
 * types, an empty string (which simply test for the existence of the field and
 * disregards its type), "array" which test with isArray and "event" which
 * designates an event defined through the MALUS event mechanism.
 *
 * @arg {obj}   The object instance to test.
 * @arg {iface} An object representing the interface to test against.
 * @returns     true if the object instance conforms to the interface.
 */
function implements_interface (obj, iface)
{
	print ("Testing interface " + iface + " on " + obj);
	for (let member in iface) {
		let condition = iface[member];
		if (typeof condition == "string")
			condition = {type: condition};
			
		let is_type = typeof obj[member];
		if (is_type == "undefined")
			return false;
		
		if (condition.type.length == 0)
			continue;
		switch (condition.type) {
		case "array":
			if (!((is_type == "object") && (obj[member].isArray ())))
				return false;
			break;
			
		case "event":
			if (typeof obj.has_event !== "function" || !obj.has_event (member))
				return false;
			break;
			
		default:
			if (is_type !== condition.type)
				return false
		}
	}
	
	return true;
}

