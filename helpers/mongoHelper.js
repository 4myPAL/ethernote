module.exports = function (app) {
	var mongodbConnectionString = app.config.mongodbConnectionString;
	var MongoClient = app.MongoClient;

	app.addDocInfoToDB = addDocInfoToDB;
	app.updateDocInfoInDB = updateDocInfoInDB;
	app.getSignStatusFromDB = getSignStatusFromDB;
	app.getUnSignedRequestsFromDB = getUnSignedRequestsFromDB;
	app.getSignatureRequestsByIdFromDB = getSignatureRequestsByIdFromDB;

	function addDocInfoToDB(signatureRequestId, contractVariables, contractHash, cb) {
		console.log(contractVariables);
		contractVariablesStr = JSON.stringify(contractVariables);
		contractVariablesStr = contractVariablesStr.split("$").join("");
		contractVariablesUpd = JSON.parse(contractVariablesStr);
		MongoClient.connect(mongodbConnectionString, function(err, db) {
		    if(err) {
		    	cb(err);
		    } else {
		    	var collection = db.collection('DocsForSigning');
			    collection.insert({"signatureRequestId": signatureRequestId, "contractHash": contractHash, "contractVariables": contractVariablesUpd, "isSigned": false}, function(err, docs) {
		    		if(err) {
		    			console.log(err);
				    	db.close();
				    	if(cb)
				    		cb(err);
				    } else {
				    	db.close();
				    	if (cb)
				    		cb(null);
				    }
			    });
		    }
		});
	}

	function updateDocInfoInDB(signatureRequestId, agreementHash, transactionId, cb) {
		MongoClient.connect(mongodbConnectionString, function(err, db) {
		    if(err) {
		    	console.log(err);
		    	if (cb)
		    		cb(err);
		    } else {
		    	var collection = db.collection('DocsForSigning');
		    	collection.find({"signatureRequestId": signatureRequestId }, function(err, cursor) {
				    if (err) { 
				    	if (cb)
	    					cb(err);
				    } else {
				    	cursor.toArray(function(err, results) {
				    		if (err) {
				    			console.log(err);
					    		if (cb)
	    							cb(err);
					    	} else if (results.length > 0) {
					    		console.log(results);
					    		var result = results[0];
					    		console.log(result);
					    		collection.update(
					    			{
					    				"signatureRequestId": signatureRequestId 
					    			},{
					    				"signatureRequestId": signatureRequestId,
					    				"contractHash": result.contractHash,
					    				"contractVariables": result.contractVariables,
					    				"isSigned": true,
					    				"agreementHash": agreementHash,
					    				"transactionId": transactionId
					    			});
					    		if (cb)
					    			cb(null);
					    	} else {
					    		if (cb)
	    							cb(null);
					    	}
					    	db.close();
				    	});
				    }
				});
		    }
		});
	}

	function getSignStatusFromDB(signatureRequestId, cb) {
		MongoClient.connect(mongodbConnectionString, function(err, db) {
		    if(err) {
		    	console.log(err);
		    	if (cb)
		    		cb(err, null);
		    } else {
		    	var collection = db.collection('DocsForSigning');
			    collection.find({"signatureRequestId": signatureRequestId }, function(err, cursor) {
				    if (err) { 
				    	if (cb)
	    					cb(err, null);
				    } else {
				    	cursor.toArray(function(err, results) {
				    		console.log(err);
				    		if (!results) {
					    		if (cb)
	    							cb(err);
					    	} else if (results.length > 0) {
					    		console.log(results);
					    		var result = results[0];
					    		console.log(result);
					    		cb(null, result.isSigned);
					    	} else {
					    		if (cb)
	    							cb(null, null);
					    	}
					    	db.close();
				    	});
				    }
				});
		    }
		});
	}

	function getUnSignedRequestsFromDB(cb) {
		MongoClient.connect(mongodbConnectionString, function(err, db) {
		    if(err) {
		    	console.log(err);
		    	if (cb)
		    		cb(err, null);
		    } else {
		    	var collection = db.collection('DocsForSigning');
			    collection.find({"isSigned": false }, function(err, cursor) {
				    if (err) { 
				    	if (cb)
	    					cb(err, null);
				    } else {
				    	cursor.toArray(function(err, results) {
				    		console.log(err);
				    		if (!results) {
					    		if (cb)
	    							cb(err, null);
					    	} else if (results.length > 0) {
					    		console.log(results);
					    		if (cb)
					    			cb(null, results);
					    	} else {
					    		if (cb)
	    							cb(null, null);
					    	}
					    	db.close();
				    	});
				    }
				});
		    }
		});
	}


	function getSignatureRequestsByIdFromDB(signatureRequestId, cb) {
		MongoClient.connect(mongodbConnectionString, function(err, db) {
		    if(err) {
		    	console.log(err);
		    	if (cb)
		    		cb(err, null);
		    } else {
		    	var collection = db.collection('DocsForSigning');
			    collection.find({"signatureRequestId": signatureRequestId }, function(err, cursor) {
				    if (err) { 
				    	if (cb)
	    					cb(err, null);
				    } else {
				    	cursor.toArray(function(err, results) {
				    		console.log(err);
				    		if (!results) {
					    		if (cb)
	    							cb(err, null);
					    	} else if (results.length > 0) {
					    		console.log(results);
					    		if (cb)
					    			cb(null, results);
					    	} else {
					    		if (cb) {
					    			var error = {message: "No signature requests with this id"};
	    							cb(error, null);
					    		}
					    	}
					    	db.close();
				    	});
				    }
				});
		    }
		});
	}
};