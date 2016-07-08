module.exports = function (app) {
	var MongoClient = app.MongoClient;
	var mongodbConnectionString = app.config.mongodbConnectionString;
	var randomInt = app.randomInt;
	var attachToContract = app.attachToContract;

	var getSignatureRequestsByIdFromDB = app.getSignatureRequestsByIdFromDB;
	var getAgreementHash = app.getAgreementHash;

	app.get('/', function(request, response) {
		response.render("index", {
			//address: app.contractAddress
		});
	});


	app.get('/doc/:id', function(request, response) {
		var signatureRequestId = request.params.id;
		getSignatureRequestsByIdFromDB(request.params.id, function(err, results) {
			console.log(err);
			if (err) {
				response.render("doc", {
					error: {
						title: "Error",
						message: err.message
					}
				});
			} else {
				//getAgreementHash(signatureRequestId, function(err, pdfHash) {
					if (err) {
						console.log(err);
						response.render("doc", {
							error: {
								title: "Error",
								message: err.message
							}
						});
					} else {
						var transactionId;
						var contractVariables;
						var contractHash;
						var isSigned;
						if (results.length > 0) {
							transactionId = results[0].transactionId;
							contractHash = results[0].contractHash;
							contractVariables = results[0].contractVariables;
							isSigned = results[0].isSigned;
						}
						response.render("doc", {
							docId: request.params.id,
							address: app.contractAddress,
							pdfHash: contractHash,
							transactionId: transactionId,
							contractVariables: contractVariables,
							isSigned: isSigned
						});
					}
				//});
			}
		});
	})
}