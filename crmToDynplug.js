(async function() {

	const https = require('https')
	
	exports.ciaramellaToYaaaeapa = function(compiler, code, initial_block, control_inputs, initial_values) {
		return compiler.compile(null, false, code, initial_block, control_inputs, initial_values, 'yaaaeapa');
	}

	exports.yaaaeapaToSharedLibrary = async function (files, compilationServerUrl, compilationServerPort, onSuccessCb, onFailureCb) {

		const postData = JSON.stringify(files);
		
		const req = https.request(
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
				var bufs = [];
				res.on('data', (chunk) => {
					bufs.push(chunk);
				});
				res.on('end', () => {
					if (res.statusCode == 500) {
						onFailureCb("Compilation Server Error:\n" + res.statusCode + "\nin response: \n" + bufs.join(''));
						return;
					}
					if (res.headers["compilation-result"] != "ok") {
						onFailureCb("Compilation Server Error:\n" + res.statusCode + "\n" + res.headers["Compilation-log"]);
						return;
					}
					var buf = Buffer.concat(bufs);
					onSuccessCb(buf);
				});
			}
		);

		req.on('error', (e) => {
			onFailureCb("Compilation Server Error:\nProblem with request: " + e.message);
		});

		req.write(postData);
		req.end(); 
	}

	exports.sharedLibraryToDynplug = function (sharedLibrary, dynplugServerUrl, dynplugServerPort, onSuccessCb, onFailureCb) {
	
		const req = https.request(
			{
				hostname: dynplugServerUrl,
				port: dynplugServerPort,
				path: '/uploadfile',
				method: 'POST',
				
				headers: {
					'Content-Type': 'application/octet-stream',
				}
			}, (res) => {
				let body = "";
				res.on('data', (chunk) => {
					body += chunk;
				});
				res.on('end', () => {
					if (res.statusCode == 500)
						onFailureCb("Dynplug Server Error:\n" + res.statusCode + "\n" + body)
					else
						onSuccessCb(body)
				});
			}
		);

		req.on('error', (e) => {
			onFailureCb("Dynplug Server Error:\n" + e);
		});

		req.write(sharedLibrary);
		req.end(); 
	}

	exports.ciaramellaToDynplug = async function (compiler, code, initial_block, control_inputs, initial_values, compilationServerUrl, compilationServerPort, dynplugServerUrl, dynplugServerPort, onSuccessCb, onFailureCb) {
		try {
			let ff = exports.ciaramellaToYaaaeapa(compiler, code, initial_block, control_inputs, initial_values);
		
			exports.yaaaeapaToSharedLibrary(ff, compilationServerUrl, compilationServerPort, 
				function (data) {
					exports.sharedLibraryToDynplug(data, dynplugServerUrl, dynplugServerPort, 
						onSuccessCb, 
						onFailureCb
					);
				}, 	
				onFailureCb
			)
		} catch (e) {
			onFailureCb(e)
			return;
		}	
	}
}());