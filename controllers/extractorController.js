const extractorModel = require('../models/extractorModel');
const gpmfExtract = require('gpmf-extract')
const goproTelemetry = require('gopro-telemetry')
const axios = require('axios');
let percentageValue = 0;

const extractorController = {

  getHello: async (req, res) => {
    res.json("App: Rest API Extract Gopro Telemetry")
  },

  getTelemetryByFilter: async (req, res) => {
    const telemetryData = {
      progress: Math.round(percentageValue)
    };
    res.json(telemetryData);
  },

  postTelemetryByFilter: async (req, res) => {
    const { url } = req.body

    axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    }).then(function (response) {

      const fileLength = response.headers['content-length'];
      let bytesRead = 0;
      const chunks = [];

      response.data.on('error', (error) => res.log(error.message));
      response.data.on('data', (chunk) => {
        chunks.push(chunk);
        bytesRead += chunk.length;
        console.log(`${bytesRead} bytes read`);
        const percentage = Math.round((bytesRead / fileLength) * 100);
        console.log(`Progress: ${percentage} %`);
        percentageValue = percentage / 3;
      });
      response.data.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`Finished reading file with length ${buffer.length}`);

        // const progress = percent => percentageValue += percent / 3;
        // const cancellationToken = { cancelled: false };
        // gpmfExtract(file, { browserMode: true, progress, cancellationToken }).then(
        //   res => {
        //     console.log('Length of data received:', res.rawData.length);
        //     console.log('Framerate of data received:', 1 / res.timing.frameDuration)
        //     console.log(percentageValue)
        //     //if (!res) return;
        //   }
        // ).catch(error => console.error(error));

        //cancellationToken.cancelled = true;


        gpmfExtract(buffer)
          .then(extracted => {
            console.log('Length of data received:', extracted.rawData.length);
            console.log('Framerate of data received:', 1 / extracted.timing.frameDuration);
            console.log('--------------------------')
            console.log('Process: gpmfExtract')
            console.log('Status : Extracted success')

            const optionsGPS = {
              stream: ['GPS5'],
              timeIn: 'GPS',
              groupTimes: 1000,
              WrongSpeed: 225,
              GPS5Fix: 2,
              GPS5Precision: 625
            };

            const optionsACCL = {
              stream: ['ACCL'],
              timeIn: 'GPS',
              groupTimes: 10
            };

            percentageValue = percentageValue + (100 / 3)

            const promiseGPS = new Promise((resolve, reject) => {
              goproTelemetry(extracted, optionsGPS, telemetry => {
                percentageValue = percentageValue + (100 / 3 / 4)
                console.log('--------------------------')
                console.log('Process: goproTelemetry')
                console.log('Status : GPS Extracted success')
                resolve(telemetry[1].streams)
              }).catch(error => reject(error.message))
            })

            const promiseACCL = new Promise((resolve, reject) => {
              goproTelemetry(extracted, optionsACCL, telemetry => {
                percentageValue = percentageValue + (100 / 3 / 4)
                console.log('--------------------------')
                console.log('Process: goproTelemetry')
                console.log('Status : ACCL Extracted success')
                resolve(telemetry[1].streams)
              }).catch(error => reject(error.message))
            })

            Promise.all([promiseGPS, promiseACCL])
              .then(([gpsData, acclData]) => {
                percentageValue = percentageValue + (100 / 3 / 2)
                res.send({ gpsData, acclData })
              })
              .catch(error => res.status(500).send(error.message))
          })
          .catch(error => res.status(500).send(error.message))
      }).catch(error => res.error(error.message))
    }).catch(error => res.error(error.message))
  },

  getLogging: async (req, res) => {
    res.send(console.history);
  }

}

module.exports = extractorController;

