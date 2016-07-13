module.exports = function (app) {
  var crypto = app.cryptoLib;
  var https = app.https;
  var AWS = app.AWS;
  
  var util = require('util'),
  child_process = require('child_process');
  var exec = child_process.exec;
  var fs = require('fs');

  app.uploadTempAgreementFile = uploadTempAgreementFile;
  app.deleteTempAgreementFile = deleteTempAgreementFile;

  function uploadTempAgreementFile (agreementBytesArray, agreementFileName, cb ) {

    AWS.config.region = app.config.AWS.region;
    AWS.config.accessKeyId = app.config.AWS.accessKeyId;
    AWS.config.secretAccessKey = app.config.AWS.secretAccessKey;

    var s3 = new AWS.S3();
    var params = {Bucket: app.config.AWS.bucket, Key: agreementFileName, Body: agreementBytesArray};

    var pathToAgreement = "https://" + app.config.AWS.bucket + "." + app.config.AWS.host + "/" + agreementFileName;

    s3.putObject(params, function(err, data) {
      if (err) {
        console.log("*** Upload agreement Error ***");
        console.log(err);
        cb(pathToAgreement, err);
      } else {
        console.log("Successfully uploaded data to AWS S3");
        //console.log(data);
        cb(pathToAgreement, null);
      } 

    });
  }

  function deleteTempAgreementFile (key, cb) {
    
    AWS.config.region = app.config.AWS.region;
    AWS.config.accessKeyId = app.config.AWS.accessKeyId;
    AWS.config.secretAccessKey = app.config.AWS.secretAccessKey;

    var s3 = new AWS.S3();
    var params = {
      Bucket: app.config.AWS.bucket,
      Key: key
    };
    s3.deleteObject(params, function(err, data) {
      if (err) {
        console.log(err);
        if (cb)
          cb(); // an error occurred
      } else {
        console.log("Temp file successfully deleted from AWS");
        if (cb)
          cb(); // successful response
      }
    });
  }
}