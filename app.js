const express = require('express')
const gpmfExtract = require('gpmf-extract');
const goproTelemetry = require('gopro-telemetry');
const fs = require('fs');

// init express
const app = express();

let data = ''

const stream = fs.createReadStream('C:/Users/GIS-THINKPAD/your-project/project/gitLab/dps-iri/assets/sukabumi-survey-2021/GH019956.mp4');

stream.on('error', (error) => console.log(error.message));
stream.on('data', (chunk) => { data += chunk });
stream.on('end', () => console.log('Reading complete'));

// basic route
app.get('/', (req, res) => {

	gpmfExtract(data)
		.then(extracted => {
			goproTelemetry(extracted, {}, telemetry => {
				fs.writeFileSync('C:/Users/GIS-THINKPAD/your-project/project/gitLab/dps-iri/assets/sukabumi-survey-2021/output_path.json', JSON.stringify(telemetry));
				res.send(console.log('Telemetry saved as JSON'))
			});
		}).catch(error => console.error(error));

});

// listen on port
app.listen(4000, () => console.log('Server Running at http://localhost:4000'));