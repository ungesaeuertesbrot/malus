const GdkPixbuf = imports.gi.GdkPixbuf;

function Integer ()
{
	this.name = "int";
	this.constraints = ["min", "max"];
	this.init = 0;
	this.serialization_type = "INT";
	this.serialize = function (value) new Number (value).valueOf ();
	this.unserialize = function (value) value;
}

function String ()
{
	this.name = "str";
	this.constraints = ["len", "regex"];
	this.init = "";
	this.serialization_type= "STR";
	this.serialize = function (value) value.toString ();
	this.unserialize = function (value) value;
}

function Bool ()
{
	this.name = "bool";
	this.init = false;
	this.serialization_type = "INT";
	this.serialize = function (value) new Boolean (value).valueOf ();
	this.unserialize = function (value) new Boolean (value).valueOf ();
}

function Date ()
{
	this.name = "date";
	this.init = function () new window.Date ().valueOf ();
	this.serialization_type = "INT";
	this.serialize = function (value) value.getDate () + value.getMonth () << 5 + value.getYear () << 9;
	this.unserialize = function (value) new window.Date (value >> 9, (value >> 5) & 4, value & 5).valueOf ();
}

function _serialize_pixbuf (buf)
{
	if (typeof buf !== "object")
		return null;
	if (typeof buf.object_get_type != "function")
		return null;
	var type_name = /GIName:([\w.]*)/.exec (buf.toString ())[1];
	if (type_name !== "GdkPixbuf.Pixbuf")
		return null;
}

function _unserialize_pixbuf (img)
{

}

function Image ()
{
	this.name = "img";
	this.constraints = ["max_x", "max_y", "max_size"];
	this.init = null;
	this.serialization_type = "BIN";
	this.serialize = _serialize_pixbuf;
	this.unserialize = _unserialize_pixbuf;
}

