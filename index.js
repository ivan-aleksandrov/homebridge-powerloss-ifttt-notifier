"use strict";

var Service;
var https = require('https');
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

  options.path += config['IFTTTservice'] + '/with/key/' + config['IFTTTkey'];

  var req = https.request(options, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      logger('Request approved from IFTTT server');
    });
  });

  req.on('error', function (e) {
    logger('problem with request: ' + e.message);
  });

  // Always passing current timestamp as value1
  var request = '{ "value1": "' + new Date().toString() + '"';
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
  
  this._service = new Service.AccessoryInformation();
}

PowerlossIFTTTNotifier.prototype.getServices = function () {
  return [this._service];
}