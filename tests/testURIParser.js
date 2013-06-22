imports.malus.patches;

const JSUnit = imports.jsUnit;

const URIParser = imports.malus.uriparser;

function testFull() {
	let p = new URIParser.URIParser(true);
	p.parse("http://usr:pwd@www.test.com:81/dir/dir.2/index.htm?q1=0&&test1&test2=value#top");
	
	JSUnit.assertEquals("http://usr:pwd@www.test.com:81/dir/dir.2/index.htm?q1=0&&test1&test2=value#top", p.getComponent('source'));
	JSUnit.assertEquals("http", p.getComponent('protocol'));
	JSUnit.assertEquals("usr:pwd@www.test.com:81", p.getComponent('authority'));
	JSUnit.assertEquals("usr:pwd", p.getComponent('userInfo'));
	JSUnit.assertEquals("usr", p.getComponent('user'));
	JSUnit.assertEquals("pwd", p.getComponent('password'));
	JSUnit.assertEquals("www.test.com", p.getComponent('host'));
	JSUnit.assertEquals("81", p.getComponent('port'));
	JSUnit.assertEquals("/dir/dir.2/index.htm?q1=0&&test1&test2=value#top", p.getComponent('relative'));
	JSUnit.assertEquals("/dir/dir.2/index.htm", p.getComponent('path'));
	JSUnit.assertEquals("/dir/dir.2/", p.getComponent('directory'));
	JSUnit.assertEquals("index.htm", p.getComponent('file'));
	JSUnit.assertEquals("q1=0&&test1&test2=value", p.getComponent('query'));
	JSUnit.assertEquals("top", p.getComponent('anchor'));

	let q = p.getComponent("queryKeys");
	JSUnit.assert("q1" in q);
	JSUnit.assertEquals("0", q.q1);
	JSUnit.assert("test1" in q);
	JSUnit.assertEquals("", q.test1);
	JSUnit.assert("test2" in q);
	JSUnit.assertEquals("value", q.test2);
}

function testStrict() {
	let p = new URIParser.URIParser(true);
	p.parse("acme.com/dir.a?q=q");
	
	JSUnit.assertEquals("acme.com/dir.a", p.getComponent("path"));
	JSUnit.assertEquals("acme.com/", p.getComponent("directory"));
	JSUnit.assertEquals("dir.a", p.getComponent("file"));
}

function testLoose() {
	let p = new URIParser.URIParser(false);
	p.parse("acme.com:81/dir?q=q");
	
	JSUnit.assertEquals("acme.com", p.getComponent("host"));
	JSUnit.assertEquals("81", p.getComponent("port"));
	JSUnit.assertEquals("/dir", p.getComponent("directory"));
}

JSUnit.gjstestRun(this, JSUnit.setUp, JSUnit.tearDown);

