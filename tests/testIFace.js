imports.malus.patches;

const GObj = imports.gi.GObject;
const JSUnit = imports.jsUnit;

const IFace = imports.malus.iface;

function testIFace() {
	var obj = {
		str: "string",
		num: 23,
		obj: {},
		array: [],
		fun: function() {},
		NULL: null,
		undef: undefined
	};
	
	JSUnit.assert(IFace.implementsInterface(obj, {str: "string"}));
	JSUnit.assert(IFace.implementsInterface(obj, {num: "number"}));
	JSUnit.assert(IFace.implementsInterface(obj, {obj: "object"}));
	JSUnit.assert(IFace.implementsInterface(obj, {array: "array"}));
	JSUnit.assert(IFace.implementsInterface(obj, {fun: "function"}));
	JSUnit.assertFalse(IFace.implementsInterface(obj, {NULL: "object"}));
	JSUnit.assertFalse(IFace.implementsInterface(obj, {undef: "undefined"}));
	JSUnit.assert(IFace.implementsInterface(obj, {notdefined: "undefined"}));
	JSUnit.assert(IFace.implementsInterface(obj, {
		str: "string",
		num: "number",
		obj: "object",
		array: "array",
		fun: "function",
		NULL: "",
		undef: "",
		notdefined: "undefined"
	}));
	JSUnit.assertFalse(IFace.implementsInterface(obj, {
		str: "string",
		num: "number",
		obj: "object",
		array: "array",
		fun: "function",
		NULL: "",
		undef: "",
		notdefined: ""
	}));
}

function testGObject() {
	let gCls = new GObj.Class({
		Name: "TestClass",
		Signals: {
			"sig1": {}
		},
	});
	
	let gClsObj = new gCls();
	JSUnit.assert(IFace.implementsInterface(gClsObj, {sig1: "gsignal"}));
	JSUnit.assertFalse(IFace.implementsInterface(gClsObj, {sig2: "gsignal"}));
	
	let gObj = new GObj.Object({});
	JSUnit.assert(IFace.implementsInterface(gObj, {notify: "gsignal"}));
}

JSUnit.gjstestRun(this, JSUnit.setUp, JSUnit.tearDown);

