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

