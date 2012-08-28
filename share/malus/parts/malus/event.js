/**
 * The functions in this object wil be added to a prototype when an event is
 * installed for it. Through these functions the events can be accessed.
 */
const event_funcs = {
	/**
	 * Looks up if the object has an event of the specified name.
	 *
	 * @arg {name}	Name of the event.
	 * @returns		true if an event of the specified name is present.
	 */
	has_event: function (name)
	{
		return typeof this._events[name] != "undefined";	
	},


	/**
	 * Adds a function to the list of event listeners for an event. The function
	 * will be called when the event is triggered through `fire_event`.
	 *
	 * @arg {evnt}	Name of the event.
	 * @arg {func}	Function to add to list of event listeners
	 */
	add_event_listener: function (evnt, func) {
		if (!this.has_event (evnt))
			throw new Error ("no such event " + evnt);
		if (this._events[evnt].listeners.indexOf (func) >= 0)
			return;
		this._events[evnt].listeners.push (func);
	},
	
	
	/**
	 * Remove a function from the list of listeners for an event. Keep in mind
	 * that Function.prototype.bind will not do as it returns a new reference
	 * each time it is called. MALUS installs bind_once into Function.prototype
	 * which circumvents this flaw.
	 *
	 * @arg {evnt}	Name of the event.
	 * @arg {func}	Function to remove from list of listeners.
	 */
	remove_event_listener: function (evnt, func) {
		if (!this.has_event (evnt))
			throw new Error ("no such event " + evnt);
		let i = this._events[evnt].listeners.indexOf (func);
		if (i < 0)
			return;
		this._events[evnt].listeners.slice (i, 1);
	},
	
	
	/**
	 * Triggers an event by calling all listeners registered for it.
	 *
	 * @arg {evnt}	Name of the event.
	 * @arg {...}	Any further arguments will be passed on to the listeners.
	 */
	fire_event: function (evnt) {
		if (!this.has_event (evnt))
			throw new Error ("no such event " + evnt);
		let args = Array.prototype.slice.call (arguments);
		args.shift ();
		for each (let func in this._events[evnt].listeners)
			func.apply (this, args);
	}
};


function _add_event_funcs (proto)
{
	for (func in event_funcs)
		if (typeof proto[func] == "undefined")
			proto[func] = event_funcs[func];
}



function add_events (proto, names)
{
	if (typeof proto != "object")
		throw new Error ("proto must be an object");
	_add_event_funcs (proto);
	if (typeof proto._events == "undefined")
		proto._events = {};
	for each (let name in names)
		proto._events[name] = {listeners: []};
}

function add_event (proto, name)
{
	add_events (proto, [name]);
}

