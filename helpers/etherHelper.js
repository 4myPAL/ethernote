module.exports = function (app) {
	var web3 = app.web3;
	var getSignatureRequestsByIdFromDB = app.getSignatureRequestsByIdFromDB;

	var contract;
	app.attachToContract = attachToContract;
	app.addAgreementHashToContract = addAgreementHashToContract;
	app.getDocDataById = getDocDataById;

	var contractABI = app.config.smartContract.abi;

	function attachToContract(cb) {
		if(!web3.isConnected()) {
			if (cb) {
					cb({code: 200, title: "Error", message: "check RPC"}, null);
				}
		} else {
			console.log(web3.eth.accounts);
			web3.eth.defaultAccount = web3.eth.accounts[0];
			console.log("web3.eth.defaultAccount:");
			console.log(web3.eth.defaultAccount);
			
			var MyContract = web3.eth.contract(contractABI);

			contract = MyContract.at(app.contractAddress);
			
			if (cb) {
				cb(null, contract);
			}
		}
	}

	function addAgreementHashToContract(signatureRequestId, contractHash, cb) {
		if(!web3.isConnected()) {
			cb({code: 500, title: "Error", message: "check RPC"}, null);
		} else {
			contract.newDoc.sendTransaction(signatureRequestId, contractHash, {gas: 100000, from: web3.eth.defaultAccount}, function(err, result) {
				cb(err, result);
			});
		}
	}

	app.post('/api/getDocDataById', function(request, response) {
		var globalToken = request.body.globalToken;
		var signatureRequestId = request.body.signatureRequestId;
		if (app.config.useGlobalToken) {
			if (globalToken != app.config.globalToken) {
				response.send({
			      error : {
			        code : 401,
			        title : "Unauthorized",
			        message : "Wrong app token"
			      }
			    });
			    return;
			}
		}

		if (!signatureRequestId) {
			response.send({
		      error : {
		        code : 401,
		        title : "Unauthorized",
		        message : "Wrong app token"
		      }
		    });
		    return;
		}

		getDocDataById(signatureRequestId, function(err, isSigned, contractHash) {
			if (err) {
				console.log(err);
				response.send({
			      error : {
			        code : 500,
			        title : "Error",
			        message : err.message
			      }
			    });
			    return;
			}

			var message;
			if (contractHash.length > 0) {
				message = "Contract signed!";
			} else {
				message = "Contract not signed yet";
			}
			getSignatureRequestsByIdFromDB(signatureRequestId, function(err, results) {
				if (err) {
					console.log(err);
					response.send({
				      error : {
				        code : 500,
				        title : "Error",
				        message : err.message
				      }
				    });
				    return;
				}
				
				if (results.length > 0) {
					var result = results[0];
					response.send({
				      success : {
				        code : 200,
				        title : "Success",
				        message : message,
				        contractHash: contractHash,
				        transactionId : result.transactionId,
				        isSigned: isSigned
				      }
				    });
				} else {
					response.send({
				      success : {
				        code : 200,
				        title : "Success",
				        message : message,
				        contractHash: contractHash,
				        isSigned: isSigned
				      }
				    });
				}
			});
		});
	});

	function getDocDataById(signatureRequestId, cb) {
		attachToContract(function(err, contract) {
			if (err) {
				console.log(err);
				cb(err, null, null);
				return;
			}

			console.log(contract);
			var contractHash = contract.getDocHashById.call(signatureRequestId, function(err, obj) {
				console.log("err:");
				console.log(err);
				console.log("obj:");
				console.log(obj);
				console.log(obj.length);

				var message;
				var isSigned;
				if (obj.length > 0) {
					message = "Contract signed!";
					isSigned = true;
				} else {
					message = "Contract not signed yet";
					isSigned = false;
				}
				cb(null, isSigned, obj);
			});
		});
	}
};