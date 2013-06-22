/*
 * The MIT License (MIT)
 * 
 * Copyright (c) 2007, 2013 Steven Levithan <stevenlevithan.com>, Thorsten Schoel
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Based upon parseUri 1.2.2


const _KEYS = ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];
const _KEY_QUERY_KEYS = "queryKeys";

const _PARSERS = {
	strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
	loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
	query: /(?:^|&)([^&=]*)=?([^&]*)/g
};


function URIParser(strict) {
	this._init(Boolean(strict));
}

URIParser.prototype = {
	_init: function(strict) {
		this._strict = strict;
	},
	
	parse: function(uri) {
		this._uri = uri;
		let m = _PARSERS[this._strict ? "strict" : "loose"].exec(uri);
		this._components = {};
		
		for (let i = 0; i < _KEYS.length; i++)
			this._components[_KEYS[i]] = m[i] || "";
		
		this._components[_KEY_QUERY_KEYS] = {};
		this._components[_KEYS[12]].replace(_PARSERS.query, function($0, $1, $2) {
			if ($1)
				this._components[_KEY_QUERY_KEYS][$1] = $2;
		}.bind(this));
	},
	
	getLastURI: function() {
		return this._uri;
	},
	
	getComponent: function(key) {
		return this._components[key];
	},
};

