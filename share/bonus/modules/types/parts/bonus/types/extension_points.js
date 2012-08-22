function test_primitive (obj)
{
	return (typeof obj.name == "string"
			&& typeof obj.serialization_type == "string"
			&& ["STR", "INT", "REAL", "BIN"].indexOf (obj.serialization_type) >= 0
			&& typeof obj.serialize == "function"
			&& (typeof obj.constraints == "undefined"
				|| Array.isArray (obj.constraints))
			&& typeof obj.init != "undefined"
			);
}
