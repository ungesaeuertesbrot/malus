const event_funcs = {
	has_event: function (name)
	{
		return typeof this._events[name] != "undefined";	
	},

	add_event_listener: function (evnt, func) {
		if (!this.has_event (evnt))
			throw new Error ("no such event " + evnt);
		if (this._events[evnt].listeners.indexOf (func) >= 0)
			return;
		this._events[evnt].listeners.push (func);
	},
	
	remove_event_listener: function (evnt, func) {
		if (!this.has_event (evnt))
			throw new Error ("no such event " + evnt);
		let i = this._events[evnt].listeners.indexOf (func);
		if (i < 0)
			return;
		this._events[evnt].listeners.slice (i, 1);
	},
	
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

