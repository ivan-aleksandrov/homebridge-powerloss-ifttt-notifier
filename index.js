"use strict";

var Service;
var https = require('https');
var startTimestamp;

var options = {
  host: 'maker.ifttt.com',
  port: 443,
  path: '/trigger/',
  method: 'POST',
  headers: {
    "content-type": "application/json"
  }
};

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  homebridge.registerAccessory("homebridge-powerloss-ifttt-notifier", "PowerlossIFTTTNotifier", PowerlossIFTTTNotifier);
}

function PowerlossIFTTTNotifier(log, config) {
  var logger = log;
  var startTimestamp = new Date().toString();
  options.path += config['IFTTTservice'] + '/with/key/' + config['IFTTTkey'];

  function requesting(options, callback) {
    var req = https.request(options, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        logger('Request approved from IFTTT server');
      });
    });

    req.on('error', function (e) {
      if (e.message && (e.message.startsWith("getaddrinfo ENOTFOUND") || e.message.startsWith("getaddrinfo EAI_AGAIN"))) {
        // Retry in 30 seconds if no internet connection
        logger('No internet connection. Retrying connection in 30 seconds');
        setTimeout(function () { return requesting(options, callback) }, 30000);
      } else {
        logger('problem with request: ' + e.message);
      }
    });

    // Always passing current timestamp as value1
    var request = '{ "value1": "' + startTimestamp + '"';
    if (config['IFTTTvalue2']) {
      request += ', "value2": "' + config['IFTTTvalue2'] + '"';
      if (config['IFTTTvalue3']) {
        request += ', "value3": "' + config['IFTTTvalue3'] + '"';
      }
    }
    request += ' }'
    logger("Sending request: " + request);

    req.write(request);
    req.end();
  };
  requesting(options, function (err, resp) {
    // Continue
  });

  this._service = new Service.AccessoryInformation();
}

PowerlossIFTTTNotifier.prototype.getServices = function () {
  return [this._service];
}
