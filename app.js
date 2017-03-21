var express = require('express');
var http = require('http');
var https = require('https');
var mongodb = require('mongodb');
var bodyParser = require('body-parser');
var fs = require('fs');
var Web3 = require('web3');
var crypto = require('crypto');
var AWS = require('aws-sdk');
var uuid = require('uuid');
var multiparty = require('multiparty');
//var multer  = require('multer');

var MongoClient = mongodb.MongoClient;

var provider = require('./helpers/basicauthhttpprovider');

var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var hellosign = require('hellosign-sdk')({key: config.helloSignKey});

var web3;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  if (config.Ethereum[config.environment].user && config.Ethereum[config.environment].pass)
    web3 = new Web3(new provider(config.Ethereum[config.environment].rpc, config.Ethereum[config.environment].user, config.Ethereum[config.environment].pass));
  else
    web3 = new Web3(new Web3.providers.HttpProvider(config.Ethereum[config.environment].rpc));
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var app = express();

app.config = config;
app.fs = fs;
app.http = http;
app.https = https;
app.bodyParser = bodyParser;
app.web3 = web3;
app.crypto = crypto;
app.hellosign = hellosign;
app.uuid = uuid;
app.multiparty = multiparty;
//app.multer = multer;

app.MongoClient = MongoClient;

app.AWS = AWS;

app.contractAddress = config.Ethereum.smartContract.contractAddress[config.environment];
app.contractWallet = config.Ethereum[config.environment].acc;

function errorHandler(err, req, res, next) {
  	res.status(500);
  	res.send({
      error : {
        code : 500,
        message : "Error",
        err : err.message
      }
    });
}

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(errorHandler);

process.on('uncaughtException', function(err) {
  console.error(err.stack);
});

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'pug');

//require('./helpers/commonHelper')(app);
require('./helpers/mongoHelper.js')(app);
require('./helpers/etherHelper')(app);
require('./helpers/awsHelper')(app);
require('./helpers/signHelper')(app);
require('./controllers/index')(app);

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});