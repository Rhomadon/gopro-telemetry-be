const express = require('express')
const gpmfExtract = require('gpmf-extract');
const goproTelemetry = require('gopro-telemetry');
const fs = require('fs');

// init express
const app = express();

const readStream = fs.createReadStream('C:/Users/GIS-THINKPAD/Videos/gopro/GH019956.mp4');

let chunks = [];

app.get('/', (req, res) => {
	readStream.on('error', (error) => console.log(error.message));

	readStream.on('data', chunk => {
		chunks.push(chunk);
		console.log(chunk.length)
	});

	readStream.on('end', () => {
		const buffer = Buffer.concat(chunks);
		// buffer is now a binary buffer
		try {
			gpmfExtract(buffer)
				.then(extracted => {
					console.log('gpmf ok')
					goproTelemetry(extracted, {}, telemetry => {
						console.log('gopro ok')
						fs.writeFileSync('output_path.json', JSON.stringify(telemetry))
						res.json('all ok')
					}).catch(error => console.error(error))
				}).catch(error => console.error(error))
		} catch (error) {
			res.json({
				message: error.message
			})
		}

	});
})

// listen on port
app.listen(4000, () => console.log('Server Running at http://localhost:4000'));
