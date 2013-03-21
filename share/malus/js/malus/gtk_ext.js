/**
 * Connect signals to a GtkBuilder.
 *
 * @arg builder A GtkBuilder to connect to.
 * @arg js_handler_obj A JavaScript object that contains the functions to be
 *                     connected to the builder.
 */
function builder_connect_signals (builder, js_handlers_obj) {
	builder.connect_signals_full (function (builder, obj, sig_name, handler_name, connect_obj, flags) {
		obj.connect (sig_name, js_handlers_obj[handler_name].bind (obj));
	});
}


/**
 * Connect signals and objects from a GtkBuilder.
 *
 * @arg builder A GtkBuilder to connect to.
 * @arg js_events A JavaScript object containing the event handlers to be
 *                connected
 * @arg js_objects An object containing any number of fields initialized to null
 *                 that will be set with the objects of the same name from
 *                 builder.
 */
function builder_connect (builder, js_events, js_objects) {
	builder_connect_signals (builder, js_connector);
	
	for (let field in js_object_sink) {
		if (js_object_sink[field] === null)
			js_object_sink[field] = builder.get_object (field);
	}
}

