(async function() {

	const http = require('http')
	
	exports.ciaramellaToYaaaeapa = function(compiler, code, initial_block, control_inputs, initial_values) {
		return compiler.compile(null, false, code, initial_block, control_inputs, initial_values, 'yaaaeapa');
	}

	exports.yaaaeapaToSharedLibrary = function (files, compilationServerUrl, compilationServerPort, onSuccessCb) {

		const postData = JSON.stringify(files);
		
		const req = http.request(
			{
				hostname: compilationServerUrl,
				port: compilationServerPort,
				path: '/uploadfiles',
				method: 'POST',
				
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(postData),
				}
			}, (res) => {
				console.log("res STATUS:", res.statusCode);
				console.log("res HEADERS:", res.headers);
				if (res.headers["compilation-result"] != "ok") {
					console.log("Compilation failed.");
					return
				}
				var bufs = [];
				res.on('data', (chunk) => {
					bufs.push(chunk);
				});
				res.on('end', () => {
					var buf = Buffer.concat(bufs);
					onSuccessCb(buf);
				});
			}
		);

		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});

		req.write(postData);
		req.end(); 
	}

	exports.sharedLibraryToDynplug = function (sharedLibrary, dynplugServerUrl, dynplugServerPort) {
	
		const req = http.request(
			{
				hostname: dynplugServerUrl,
				port: dynplugServerPort,
				path: '/uploadfile',
				method: 'POST',
				
				headers: {
					'Content-Type': 'application/octet-stream',
				}
			}, (res) => {
				console.log("res STATUS:", res.statusCode);
				console.log("res HEADERS:", res.headers);
				
				res.on('data', (chunk) => {
					console.log(`response's BODY: ${chunk}`);
				});
				res.on('end', () => {
					console.log('No more data in response.');
				});
			}
		);

		req.on('error', (e) => {
			console.error(`problem with request: ${e.message}`);
		});

		req.write(sharedLibrary);
		req.end(); 
	}

	exports.ciaramellaToDynplug = async function (compiler, code, initial_block, control_inputs, initial_values, compilationServerUrl, compilationServerPort, dynplugServerUrl, dynplugServerPort) {
		var ff = exports.ciaramellaToYaaaeapa(compiler, code, initial_block, control_inputs, initial_values);
		var ot = await exports.yaaaeapaToSharedLibrary(ff, compilationServerUrl, compilationServerPort, function (data) {
			exports.sharedLibraryToDynplug(data, dynplugServerUrl, dynplugServerPort);
		})
	}
}());