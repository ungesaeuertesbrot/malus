imports.malus.patches;

const JSUnit = imports.jsUnit;

const Injection = imports.malus.injection;

function testSource() {
	var injector;
	var src = {};
	
	injector = new Injection.Injector(src);
	JSUnit.assertEquals(src, injector.getInjectionSource());
	
	injector.addInjectable("foo", "foo");
	JSUnit.assertNotUndefined(src.foo);
	JSUnit.assertEquals(src.foo, "foo");
	
	JSUnit.assertRaises(function() {injector.addInjectable("foo", "bar");});
	JSUnit.assertRaises(function() {injector.addInjectable(null, null);});
}

function testInjection() {
	var injector;
	var obj = {};
	var src = {foo: "foo", bar: 23, baz: obj, "_complex.key{1}": "complex"};
	var dest;
	
	injector = new Injection.Injector(src);
	
	dest = {
		foo: null,
		complex: "_complex.key{1}",
		noInject: false
	};
	
	let origPrinterr = window.printerr;
	printedErrors = 0;
	window.printerr = function(msg) {
		printedErrors++;
	};
	
	injector.inject(dest);
	JSUnit.assertNotEquals(printedErrors, 0);
	JSUnit.assertEquals(dest.foo, src.foo);
	JSUnit.assertEquals(dest.complex, src["_complex.key{1}"]);
	JSUnit.assertFalse(dest.noInject);
	
	printedErrors = 0;
	injector.inject(dest, null, true);
	JSUnit.assertEquals(printedErrors, 0);
	
	window.printerr = origPrinterr;

	dest = {foo: null, bar_: null};
	injector.inject(dest, ["foo"], true);
	JSUnit.assertEquals(src.foo, dest.foo);
	JSUnit.assertNull(dest.bar_);
	
	injector.inject(dest, {bar_: "bar"}, true);
	JSUnit.assertEquals(src.bar, dest.bar_);
}

JSUnit.gjstestRun(this, JSUnit.setUp, JSUnit.tearDown);

