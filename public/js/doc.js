$(document).ready(function() {
	var stepNum = $('.stepNum');
	var contractVariablesHiddenInput = $('.contractVariables');
	var historyContainer = $('.historyContainer');
	var contractHeaderContainer = $('.contractHeaderContainer');
	var contactHeaderDocumentId = $('#contactHeaderDocumentId');
	var contactHeaderTransactionId = $('#contactHeaderTransactionId');
	var templateContainer = $('.templateContainer');
	var historyLineContainer = $('.historyLineContainer');
	var historyOuterItem = $('.historyOuterItem');
	var invalidEmails = [];

	templateContainer.css("padding","40px 80px 60px 120px;");

	historyOuterItem.each(function(i, el) {
		console.log($(el).outerHeight());
		historyLineContainer.eq(i).height($(el).outerHeight());
	});

	var historyStep_1 = $("#historyStep_1");
	var historyStep_2 = $("#historyStep_2");
	var historyStep_3 = $("#historyStep_3");
	var historyStep_4 = $("#historyStep_4");
	var historyStep_5 = $("#historyStep_5");

	var historyItem_3 = $('#historyItem_3');

	var contractVariables;

	$('.templateInnerContainer').load('../template.html', function() {
	    contractVariables = JSON.parse(contractVariablesHiddenInput.val());
	    if (contractVariables) {
	    	for (prop in contractVariables) {
		    	console.log(prop);
		    	console.log(contractVariables[prop]);
		    	addVariableVal(prop, contractVariables[prop]);
		    }
	    }
	});

	if (stepNum.val() == parseInt(3)) {
		var findContractInEthereumTimer = setInterval(function () {
			findContractInEthereumConinuosly()
		}, 2000);
	} else {
		chnageToSignedState();
	}

	function addVariableVal(prop, val) {
		$("#\\$" + prop).text(val);
		$("#\\$" + prop).removeClass("templateVariable");
	}

	function findContractInEthereumConinuosly() {
		$.post("/api/getDocDataById", {
			"globalToken": "ac9daa79e8314b1abc07775df7608195",
			"signatureRequestId": contactHeaderDocumentId.text()
		}, function( data ) {
			if (data.success.isSigned) {
				swal({   
					title: "Success",   
					text: "Contract is signed!",   
					type: "success"
				});
				stepNum.val(4);
				contactHeaderTransactionId.text(data.success.transactionId);
				chnageToSignedState();
				if (findContractInEthereumTimer)
					clearInterval(findContractInEthereumTimer);
			}
		});
	}

	function chnageToSignedState() {
		historyStep_1.removeClass("inProgress");
		historyStep_1.addClass("done");
		historyStep_2.removeClass("inProgress");
		historyStep_2.addClass("done");
		historyStep_3.removeClass("inProgress");
		historyStep_3.addClass("done");
		historyItem_3.addClass("active");
		historyItem_3.find(".historyItemTitle").addClass("active");
		historyStep_4.removeClass("notStarted");
		historyStep_4.addClass("inProgress");
	}
});
