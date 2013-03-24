/**
 * Connect signals to a GtkBuilder.
 *
 * @arg builder A GtkBuilder which to connect to.
 * @arg js_handler_obj A JavaScript object that contains the functions to be connected to the builder.
 */
function builder_connect_signals (builder, js_handlers_obj) {
	builder.connect_signals_full (function (builder, obj, sig_name, handler_name, connect_obj, flags) {
		obj.connect (sig_name, js_handlers_obj[handler_name].bind (obj));
	});
}


function builder_connect (builder, dest_events, dest_objects) {
	builder_connect_signals (builder, dest_events);
	
	for (let field in dest_objects)
		if (dest_objects[field] === null)
			dest_objects[field] = builder.get_object (field);
}

