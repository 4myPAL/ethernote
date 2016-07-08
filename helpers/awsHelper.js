module.exports = function (app) {
  var awsS3Bucket = app.awsS3Bucket;
  var awsS3Host = app.awsS3Host;
  var awsRegion = app.awsRegion;
  var awsService = app.awsService;
  var awsSecretAccessKey = app.awsSecretAccessKey;
  var awsAccessKeyId = app.awsAccessKeyId;

  var crypto = app.cryptoLib;
  var https = app.https;
  var AWS = app.AWS;
  //var Acronis = app.Acronis;

  var util = require('util'),
  child_process = require('child_process');
  var exec = child_process.exec;
  var fs = require('fs');

  app.uploadTempAgreementFile = uploadTempAgreementFile;
  app.deleteTempAgreementFile = deleteTempAgreementFile;

  function uploadTempAgreementFile (agreementBytesArray, agreementFileName, cb ) {

    AWS.config.region = awsRegion;
    AWS.config.accessKeyId = awsAccessKeyId;
    AWS.config.secretAccessKey = awsSecretAccessKey;

    var s3 = new AWS.S3();
    var params = {Bucket: awsS3Bucket, Key: agreementFileName, Body: agreementBytesArray};

    var pathToAgreement = "https://" + awsS3Bucket + "." + awsS3Host + "/" + agreementFileName;

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
    
    AWS.config.region = awsRegion;
    AWS.config.accessKeyId = awsAccessKeyId;
    AWS.config.secretAccessKey = awsSecretAccessKey;

    var s3 = new AWS.S3();
    var params = {
      Bucket: awsS3Bucket,
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