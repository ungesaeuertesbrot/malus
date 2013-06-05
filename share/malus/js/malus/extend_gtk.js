/**
 * Connect signals to a GtkBuilder.
 *
 * @arg builder A GtkBuilder which to connect to.
 * @arg js_handler_obj A JavaScript object that contains the functions to be connected to the builder.
 */
function builderConnectSignals(builder, jsHandlers, that) {
	builder.connect_signals_full(function(builder, obj, sigName, handlerName, connectObj, flags) {
		if (typeof jsHandlers[handlerName] !== "function") {
			printerr("Error in %s: Could not bind event %s to %s: no such function".format(arguments.callee.name, sigName, handlerName));
			return;
		}
		that = that ? that : obj;
		obj.connect(sigName, jsHandlers[handlerName].bind(that));
	});
}


function builderConnect(builder, destEvents, destObjects, that) {
	builderConnectSignals(builder, destEvents, that);
	
	for (let field in dest_objects)
		if (destObjects[field] === null)
			destObjects[field] = builder.get_object(field);
}

