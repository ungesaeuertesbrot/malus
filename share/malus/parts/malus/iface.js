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

