#!/bin/node

// Test
console.log("Testing...");

const compiler = require('zampogna');
const crmToDynplug = require('./crmToDynplug');

const code = `
	yl, yr = A(xl, xr, vl, vr) { 
 		yl = xl * vl 
   		yr = xr * vr 
	}
`;

crmToDynplug.ciaramellaToDynplug(compiler, code, 'A', ['vl', 'vr'], '', "localhost", 10002, "x86_64", "localhost", 10001, 
	function (msg) {
		console.log("All good")
	},
	function (msg) {
		console.log("Something went wrong:")
		console.log(msg)
	}
);
