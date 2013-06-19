imports.malus.patches;

const JSUnit = imports.jsUnit;

const GLib = imports.gi.GLib;

function testFormat() {
	JSUnit.assertEquals("%s%d".format("foo", 1), "foo1");
}

function testBindOnce() {
	var func = function() {};
	var obj = {};
	var arg = {};
	
	JSUnit.assertEquals(func.bindOnce(obj), func.bindOnce(obj));
	JSUnit.assertEquals(func.bindOnce(obj, arg), func.bindOnce(obj, arg));
	JSUnit.assertNotEquals(func.bindOnce(obj), func.bindOnce(obj, arg));
	JSUnit.assertNotEquals(func.bindOnce(obj), func.bindOnce({}));
	JSUnit.assertNotEquals(func.bindOnce(obj), function() {}.bindOnce(obj));
}

function testGDate() {
	var gDate = GLib.Date.new_dmy(1, 10, 2013);
	
	var jsDate = gDate.to_js_date();
	JSUnit.assertNotNull(jsDate);
	JSUnit.assert(typeof jsDate === "object");
	JSUnit.assertEquals(jsDate.getTime(), (new Date(2013, 9, 1)).getTime());
	
	JSUnit.assertEquals(gDate.to_time_t() * 1000, jsDate.getTime());
	JSUnit.assertEquals(gDate.to_iso8601(), "2013-10-01");
	
	jsDate = new Date(2014, 10, 2);
	gDate.set_js_date(jsDate);
	JSUnit.assertEquals(gDate.get_julian(), GLib.Date.new_dmy(2, 11, 2014).get_julian());
}

JSUnit.gjstestRun(this, JSUnit.setUp, JSUnit.tearDown);

