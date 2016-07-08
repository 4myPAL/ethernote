module.exports = function (app) {
	var hellosign = app.hellosign;
	var fs = app.fs;
	var uploadTempAgreementFile = app.uploadTempAgreementFile;
	var deleteTempAgreementFile = app.deleteTempAgreementFile;
	var uuid = app.uuid;
	var multiparty = app.multiparty;

	var addDocInfoToDB = app.addDocInfoToDB;
	var getSignStatusFromDB = app.getSignStatusFromDB;
	var updateDocInfoInDB = app.updateDocInfoInDB;
	var getUnSignedRequestsFromDB = app.getUnSignedRequestsFromDB;
	var addAgreementHashToContract = app.addAgreementHashToContract;
	var getDocDataById = app.getDocDataById;

	app.getAgreementHash = getAgreementHash;

	app.post('/api/sendSignatureRequest', function(request, response) {
		var globalToken = request.body.globalToken;
		var borrowerEmail = request.body.borrowerEmail;
		var borrowerName = request.body.borrowerName;
		var lenderEmail = request.body.lenderEmail;
		var lenderName = request.body.lenderName;
		var dataUriString = request.body.dataUriString.split(",")[1];
		var contractVariables = request.body.contractVariables;
		console.log(contractVariables);
		var agreementBuf = new Buffer(dataUriString, 'base64');
		if (globalToken == app.config.globalToken) {
			var guidForFileName = uuid.v4();
     		var agreementFileName = guidForFileName + ".pdf";
			uploadTempAgreementFile(agreementBuf, agreementFileName, function(pathToAgreement, err) {

				var contractHash = app.crypto.createHmac('sha256', app.config.hashSalt)
                   	.update(agreementBuf)
                   	.digest('hex');

				console.log("pathToAgreement: " + pathToAgreement);
				if(err) {
			        console.log(err);
			        response.send({
				      error : {
				        code : 500,
				        title : "Error",
				        message : err.message
				      }
				    });
			    } else {
			    	var options = {
					    test_mode : 1,
					    title : 'EtherNote',
					    subject : 'The EtherNote agreement awaiting of your signature',
					    message : 'Please, sign this agreement.',
					    signers : [
					        {
					            email_address : borrowerEmail,
					            name : borrowerName
					        },
					        {
					            email_address : lenderEmail,
					            name : lenderName
					        }
					    ],
					    file_url : [pathToAgreement]
					};

					hellosign.signatureRequest.send(options)
					    .then(function(hsResponse){
					        //parse response
					        console.log(hsResponse);
					        var signatureRequest = hsResponse.signature_request;
					        var signatureRequestId = signatureRequest.signature_request_id;
					        var docUrl = signatureRequest.files_url;
					        deleteTempAgreementFile(agreementFileName, null);
					        addDocInfoToDB(signatureRequestId, contractVariables, contractHash, null);
					        response.send({
						      success : {
						        code : 200,
						        title : "Success",
						        message : "Signing request successfully sent",
						        signatureRequestId : signatureRequestId
						      }
						    });
					    })
					    .catch(function(err){
					        //catch error
					        console.log(err);
					        response.send({
						      error : {
						        code : 500,
						        title : "Error",
						        message : err.message
						      }
						    });
					    });
			    }
			})
		} else {
			response.send({
		      error : {
		        code : 401,
		        title : "Unauthorized",
		        message : "Wrong app token"
		      }
		    });
		}
	});


	/*app.post('/api/getAgreementHash', function(request, response) {
		var globalToken = request.body.globalToken;
		var signatureRequestId = request.body.signatureRequestId;

		if (globalToken == app.config.globalToken) {
			getAgreementHash(signatureRequestId, function(err, agreementHash) {
				if (err) {
					console.log(err);
			    	response.send({
				      error : {
				        code : 500,
				        title : "Error",
				        message : err.message
				      }
				    });
				} else {
					hellosign.signatureRequest.get(signatureRequestId)
				    .then(function(getSRResponse){
				        console.log(getSRResponse);
				        fs.unlink(path, function(err) {
				        	if (!err) {
				        		console.log("temp agreement file successfully removed");
				        	} else {
				        		console.log(err);
				        	}
				        })
				        response.send({
					      success : {
					        code : 200,
					        title : "Success",
					        agreementHash : hash,
					        isSigned: getSRResponse.signature_request.is_complete
					      }
					    });
				    })
				    .catch(function(err){
				        console.log(err);
				    	response.send({
					      error : {
					        code : 500,
					        title : "Error",
					        message : err.message
					      }
					    });
				    });
				}
     		});
		} else {
			response.send({
		      error : {
		        code : 401,
		        title : "Unauthorized",
		        message : "Wrong app token"
		      }
		    });
		}
	})*/

	/*app.post('/api/checkStatusOfSigningById', function(request, response) {
		var globalToken = request.body.globalToken;
		var signatureRequestId = request.body.signatureRequestId;
		if (globalToken == app.config.globalToken) {
			checkStatusOfSigningById(signatureRequestId, function(err, isSignedFromHelloSign) {
				if (err) {
					console.log(err);
			    	response.send({
				      error : {
				        code : 500,
				        title : "Error",
				        message : err.message
				      }
				    });	
				} else {
					if (isSignedFromHelloSign) {
						checkStatusOfSignStatusFromDBAndSendToContract(signatureRequestId, function(err) {
							if (err) {
								console.log(err);
						    	response.send({
							      error : {
							        code : 500,
							        title : "Error",
							        message : err.message
							      }
							    });
							} else {
								response.send({
							      success : {
							        code : 200,
							        title : "Success",
							        isSigned: isSignedFromHelloSign
							      }
							    });
							}
						});
					}
				}
			});
		} else {
			response.send({
		      error : {
		        code : 401,
		        title : "Unauthorized",
		        message : "Wrong app token"
		      }
		    });
		}
	})*/

	/*app.post('/api/checkStatusOfSigning', function(request, response) {
		var globalToken = request.body.globalToken;
		if (globalToken == app.config.globalToken) {
			getUnSignedRequestsFromDB(function(err, rows) {
				if (err) {
					console.log(err);
			    	response.send({
				      error : {
				        code : 500,
				        title : "Error",
				        message : err.message
				      }
				    });
				} else {
					for (var i = 0; i < rows.length; i++) {
						var row = rows[i];
						var signatureRequestId = row.signatureRequestId;
						checkStatusOfSigningById(signatureRequestId, function(err, isSignedFromHelloSign) {
							if (err) {
								console.log(err);
						    	response.send({
							      error : {
							        code : 500,
							        title : "Error",
							        message : err.message
							      }
							    });	
							} else {
								console.log("isSignedFromHelloSign: " + isSignedFromHelloSign);
								if (isSignedFromHelloSign) {
									getAgreementHash(signatureRequestId, function(err, agreementHash) {
										if (err) {
											console.log(err);
										} else {
											addAgreementHashToContract(agreementHash, function(err, transactionId) {
												updateDocInfoInDB(signatureRequestId, agreementHash, transactionId, null);
												console.log(err);
											});
										}
									});
								} else {
									console.log("Finish! No signed documents");
								}
							}
						});
					}
				}
			});
		} else {
			response.send({
		      error : {
		        code : 401,
		        title : "Unauthorized",
		        message : "Wrong app token"
		      }
		    });
		}
	})*/

	app.post('/api/helloSignCallback', function(request, response) {
		var form = new multiparty.Form();
		var jsonFromForm;
		console.log(request.params);
		console.log(request.body);

		form.on('part', function(part) {
	        // You *must* act on the part by reading it
	        // NOTE: if you want to ignore it, just call "part.resume()"

	        if (!part.filename) {
	          // filename is not defined when this is a field and not a file
	          console.log('got field named ' + part.name);
	          var strBuf;
	          if (part.name == "json") {
	            part.on('data', function (chunk) {
	                if (!strBuf)
	                  strBuf = chunk;
	                else
	                  strBuf = Buffer.concat([strBuf, chunk]);;
	              })
	            .on('end', function () {
	              if (strBuf)
	                jsonFromForm = strBuf.toString('utf8');
	            });
	          } 
	          part.resume();
	        }

	        part.on('error', function(err) {
	        	console.log(err);
	        	response.send({
					success:  {
						code: 500,
						message: err.message
					}
				});
	        });
	     });

	    form.on('close', function() {
	        console.log('Upload completed!');
	        console.log(jsonFromForm);

	        var parsedJSON = JSON.parse(jsonFromForm);

	        console.log("ParsedJSON:");
	        console.log(parsedJSON);

	        var signatureRequest = parsedJSON.signature_request;
	        console.log("signatureRequest:");
	        console.log(signatureRequest);
	        var event = parsedJSON.event;
	        console.log("event:");
	        console.log(event);

	        if (event) {
	        	console.log("!!!We found event!!");
	        	if (event.event_type == "signature_request_all_signed") {
	        		console.log("!!!Everybody signed document!!!");
	        		if (signatureRequest) {
			        	var signatureRequestId = signatureRequest.signature_request_id;

				        if (signatureRequestId) {
				        	getSignStatusFromDB(signatureRequestId, function(err, isSigned) {
				        	//getDocDataById(signatureRequestId, function(err, isSigned, contractHashFromEthereum) {
								if (err) {
									console.log(err);
									response.send({
										success:  {
											code: 500,
											message: err.message
										}
									});
								} else {
									console.log(isSigned);
									if (!isSigned) {
										console.log("!!!Contract is not signed yet!!!");
										getAgreementHash(signatureRequestId, function(err, agreementHash) {
											if (err) {
												console.log(err);
												response.send({
													success:  {
														code: 500,
														message: err.message
													}
												});
											} else {
												console.log("!!!Agreemnet hash is got!!!");
												console.log("!!!signatureRequestId: " + signatureRequestId + "!!!");
												console.log("!!!agreementHash: " + agreementHash + "!!!");
												addAgreementHashToContract(signatureRequestId, agreementHash, function(err, transactionId) {
													console.log("!!!Add agreement to contract!!!");
													console.log("!!!transactionId: " + transactionId + " !!!");
													if (err) {
														console.log(err);
														response.send({
															success:  {
																code: 500,
																message: err.message
															}
														});
													} else {
														updateDocInfoInDB(signatureRequestId, agreementHash, transactionId, function(err) {
															if (err) {
																console.log(err);
																response.send({
																	success:  {
																		code: 500,
																		message: err.message
																	}
																});
															} else {
																response.send({
																	success:  {
																		code: 200,
																		message: "Hello API Event Received"
									                               	}
									                       		});
															}
														});
													}
												});
											}
										});
									}
								}
							})
				        } else {
				        	response.send({
								success:  {
									code: 200,
									message: "Hello API Event Received"
		                       	}
		               		});
				        }
			        } else {
			        	response.send({
							success:  {
								code: 200,
								message: "Hello API Event Received"
	                       	}
	               		});
			        }
	        	} else {
	        		response.send({
						success:  {
							code: 200,
							message: "Hello API Event Received"
                       	}
               		});
	        	}
	        } else {
	        	response.send({
					success:  {
						code: 200,
						message: "Hello API Event Received"
                   	}
           		});
	        }
	    });

	    form.parse(request);
	});

	/*function checkStatusOfSigningById(signatureRequestId, cb) {
		hellosign.signatureRequest.get(signatureRequestId)
		.then(function(getSRResponse){
			console.log(getSRResponse);
			cb(null, getSRResponse.signature_request.is_complete);
		});
	}*/

	function checkStatusOfSignStatusFromDBAndSendToContract(signatureRequestId, cb) {
		getSignStatusFromDB(signatureRequestId, function(err, isSigned) {
			if (err) {
				console.log(err);
		    	cb(err);
			} else {
				console.log(isSigned);
				if (!isSigned) {
					getAgreementHash(signatureRequestId, function(err, agreementHash) {
						if (err) {
							cb(err);
						} else {
							addAgreementHashToContract(signatureRequestId, agreementHash, function(err, transactionId) {
								if (err)
									cb(err);
								else {
									updateDocInfoInDB(signatureRequestId, agreementHash, transactionId, null);
									cb(null)
								}
							});
						}
					});
				}
			}
		})
	}

	function getAgreementHash(signatureRequestId, cb) {
		var guidForFileName = uuid.v4();
     	var agreementFileName = guidForFileName + ".pdf";
     	
     	var path = "../tmp/" + agreementFileName;

     	//for test
     	//var path = "./tmp/" + agreementFileName;

		hellosign.signatureRequest.download(signatureRequestId, {file_type: 'pdf'}, function(err, resp) {
				//console.log(err);
				//console.log(resp);
			    var fileStream = fs.createWriteStream(path);
			    resp.pipe(fileStream);
			    fileStream.on('finish', function() {
			    	//console.log(fileStream);
			    	console.log(fileStream.path);
			        fileStream.close();
			        fs.readFile(path, "base64", function (err, agreementData) {
					    if (err) {
					    	console.log(err);
					    	cb(err, null);
					    } else {
					    	//console.log(agreementData);
						    var hash = app.crypto.createHmac('sha256', app.config.hashSalt)
			                   	.update(agreementData)
			                   	.digest('hex');

						        fs.unlink(path, function(err) {
						        	if (!err) {
						        		console.log("temp agreement file successfully removed");
						        	} else {
						        		console.log(err);
						        	}
						        })
						        
							    cb(null, hash);
					    }
					});
			    });
			});
	}
};