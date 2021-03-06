const GLib = imports.gi.GLib;

/**
 * Convert the GDate to a native JavaScript Date object.
 *
 * @returns A new Date object set to the values from the GDate at 00:00:00.0.
 */
GLib.Date.prototype.to_js_date = function() {
	return new Date(this.get_year(), this.get_month() - 1, this.get_day());
};


/**
 * Convert the GDate to a time_t.
 *
 * @returns A number indicating the seconds elapsed since 1970-01-01T00:00:00.0.
 * 			Remember that JavaScript Date.valueOf and similar will give you
 * 			milli-seconds instead!
 */
GLib.Date.prototype.to_time_t = function() {
	return new Date(this.get_year(), this.get_month() - 1, this.get_day()).valueOf() / 1000;
};


/**
 * Convert the GDate to an international string representation (yyyy-mm-dd).
 *
 * @returns The formatted date.
 */
GLib.Date.prototype.to_iso8601 = function() {
	let year = this.get_year().toString();
	let month = this.get_month().toString();
	let day = this.get_day().toString();
	if (month.length === 1)
		month = "0" + month;
	if (day.length === 1)
		day = "0" + day;
	return year + "-" + month + "-" + day;
};


/**
 * Set the value of the GDate from the date part of a JavaScript Date object.
 *
 * @arg {jsdate} A JavaScript Date object to use.
 */
GLib.Date.prototype.set_js_date = function(jsdate) {
	this.set_dmy(jsdate.getDate(), jsdate.getMonth() + 1, jsdate.getFullYear());
};

