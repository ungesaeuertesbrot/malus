const JSUnit = imports.jsUnit;

const Version = imports.malus.version;

function testCreate() {
	var version;
	
	var vStr = "1.1.1.1";
	version = new Version.Version(vStr);
	JSUnit.assert(version.major === 1
				  && version.minor === 1
				  && version.revision === 1
				  && version.point === 1);
	JSUnit.assertEquals(version.toString(), vStr);
	
	vStr = "";
	version = new Version.Version(vStr);
	JSUnit.assert(version.major === 0
				  && version.minor === 0
				  && version.revision === 0
				  && version.point === 0);
	
	vStr = "1.a.2";
	version = new Version.Version(vStr);
	JSUnit.assert(version.major === 1
				  && version.minor === 0
				  && version.revision === 0
				  && version.point === 0);
}

function testCompare() {
	var v1, v2;
	
	v1 = new Version.Version("1");
	v2 = new Version.Version("2");
	
	JSUnit.assert(v1.compare(v2) < 0);
	JSUnit.assert(v2.compare(v1) > 0);
	
	v1 = new Version.Version("2");
	
	JSUnit.assert(v1.compare(v2) === 0);
	
	JSUnit.assert(v1.compare("2") === 0);
}

function testToString() {
	var version;
	
	var vStr = "1.1.1.1";
	version = new Version.Version(vStr);
	JSUnit.assertEquals(vStr, version.toString());
	
	vStr = "1.1.1.0";
	version = new Version.Version(vStr);
	JSUnit.assertEquals(version.toString(), "1.1.1");

	vStr = "1.1.0.0";
	version = new Version.Version(vStr);
	JSUnit.assertEquals(version.toString(), "1.1");

	vStr = "1.0.0.0";
	version = new Version.Version(vStr);
	JSUnit.assertEquals(version.toString(), "1.0");
}

print("foo");
JSUnit.gjstestRun(this, JSUnit.setUp, JSUnit.tearDown);

