$(document).ready(function() {
	var stepNum = $('.stepNum');
	var varsStructHiddenInput = $('.varsStruct');
	var templateEditorContainer = $(".templateEditorContainer");
	var historyContainer = $('.historyContainer');
	var contractHeaderContainer = $('.contractHeaderContainer');
	var templateEditorForm = $(".templateEditorForm");
	var submitButton = $(".submit");
	var invalidEmails = [];

	var contractVariables = {};

	historyContainer.addClass("hidden");
	contractHeaderContainer.addClass("hidden");

	stepNum.val(1);

	$('.templateInnerContainer').load('../template.html', function() {
		$.getJSON("../variables.json", function(varsStruct) {
		    //console.log(varsStruct);
		    varsStructHiddenInput.val(JSON.stringify(varsStruct));
		    for (prop in varsStruct) {
		    	addVariableInput(varsStruct[prop], prop, 1);
		    	contractVariables[prop] = "";
		    }
		    var contractDateTime = $('#\\$ContractDateTime');
		    var formattedDate = formatDate(new Date());
			contractDateTime.text(formattedDate);
			contractVariables["ContractDateTime"] = formattedDate;
			$(".templateVariable").each(function(i, el) {
				var varObj = varsStruct[$(el).prop("id")];
				$(el).text(varObj.defaultValue);
				activateVariableInNote(varObj, el, 1);
			});
		});
	});

	submitButton.click(function(e) {
		console.log($('.templateEditorContainer'));
		var emptyInputs = $("input:visible").filter(function() {return !this.value;});
		var emptySelects = $("select:visible").filter(function() {return !this.value;});
		if (emptyInputs.length == 0 && emptySelects.length == 0) {
			if (invalidEmails.length > 0) {
				swal({   
	                title: "Warning",   
	                text: "Wrong email entered",   
	                type: "warning"
	            }, function() {
	            	$("#\\" + invalidEmails[0].id).addClass("invalid");
	            	//$("#" + invalidEmails[0].id).addClass("invalid");
	            	$("label[for='" + invalidEmails[0].id + "']").addClass("invalid");
	            });
			} else {
				var newStep = changeStepNum(+1);
				if (newStep > 4)
					newStep = 4;
				if (newStep <= 2) {
					drawFormForStep(newStep);
					if (newStep == 2)
						submitButton.text("Accept");
				} else if (newStep == 3) {
					showSpinner();
					$(this).prop('disabled', true);
					createPDFFromForm();
				}
			}
		} else {
			swal({   
                title: "Warning",   
                text: "Please, fill in all fields",   
                type: "warning"
            }, function() {
            	if (emptySelects.length > 0) {
            		$(emptySelects[0]).addClass("invalid");
            		$("label[for='\\" + $(emptySelects[0]).prop("id") + "']").addClass("invalid");
            		//$("label[for='" + $(emptySelects[0]).prop("id") + "']").addClass("invalid");
            	} else {
            		$(emptyInputs[0]).addClass("invalid");
            		$("label[for='\\" + $(emptyInputs[0]).prop("id") + "']").addClass("invalid");
            		//$("label[for='" + $(emptyInputs[0]).prop("id") + "']").addClass("invalid");
            	}
            });
		}

	});

	function createPDFFromForm() {
		$(".templateVariable").removeClass("templateVariable");

		var pdf = new jsPDF('p', 'pt', 'letter');
		var source = $("#templateContainer")[0];

		var Borrowers_Email = $("#\\$Borrowers_Email").text();
		var Borrowers_First_Name = $("#\\$Borrowers_First_Name").text();
		var Borrowers_Last_Name = $("#\\$Borrowers_Last_Name").text();

		var Lenders_Email = $("#\\$Lenders_Email").text();
		var Lenders_First_Name = $("#\\$Lenders_First_Name").text();
		var Lenders_Last_Name = $("#\\$Lenders_Last_Name").text();

		pdf.addHTML(source, function() {
			var uriString = pdf.output('datauristring');
			console.log(uriString);

			/*hideSpinner();

			submitButton.prop('disabled', false);
			
			swal({   
				title: "Success",   
				text: "success",   
				type: "success"
			}, function() {
				var newStep = changeStepNum(+1);
				templateEditorContainer.addClass("hidden");
				historyContainer.removeClass("hidden");
				contractHeaderContainer.removeClass("hidden");
			});*/

			console.log(contractVariables);

			$.post("/api/sendSignatureRequest", {
				"globalToken": "ac9daa79e8314b1abc07775df7608195",
				"dataUriString": uriString,
				"borrowerEmail": Borrowers_Email,
				"borrowerName": Borrowers_First_Name + " " + Borrowers_Last_Name,
				"lenderEmail": Lenders_Email,
				"lenderName": Lenders_First_Name + " " + Lenders_Last_Name,
				"contractVariables": contractVariables
			}, function( data ) {
				hideSpinner();
				submitButton.prop('disabled', false);
				console.log( data );
			  	if (data.success) {
			  		swal({   
						title: "Success",   
						text: data.success.message,   
						type: "success"
					}, function() {
						window.open("doc/" + data.success.signatureRequestId, "_self");
					});
			  	} else {
			  		swal({   
						title: "Error",   
						text: data.error.message,   
						type: "error"
					});
			  	}
			});
			
			//pdf.output("dataurlnewwindow");
		});

		/*margins = {
		  top: 15,
		  bottom: 15,
		  left: 15,
		  width: 522
		};*/
		/*pdf.fromHTML(
		    source,
		    margins.left,
		    margins.top,
		    {'width': margins.width},{}, margins);*/
		//pdf.output("dataurlnewwindow");
	}

	function addVariableInput(varObj, varId, step) {
		var hiddenClass;
		if (varObj.step != step)
			hiddenClass = "hidden";
		var newDivVar = $("<div id='" + varId + "_input_container' class='inputVarContainer " + hiddenClass + "'></div>");
		var newLabelInputVar = $("<label class='inputVarLabel' for='" + varId + "_input'>" + varObj.label + "</label>");
		var newInputVar;
		if (varObj.type != "date") {
			if (varObj.type == "currency") {
				newInputVar = $("<select id='" + varId + "_input' type='" + varObj.type + "' class='inputVar' required> \
					<option selected value=''></option>\
					<option value='USD'>USD</option>\
					<option value='EUR'>EUR</option>\
					</select>");
			} else if (varObj.type == "percent") {
				newInputVar = $("<input id='" + varId + "_input' type='number' class='inputVar' min=0 required onkeydown='limitNumbers(this, 2);' onkeyup='limitNumbers(this, 2);'/>");
			} else if (varObj.type == "currencyValue") {
				newInputVar = $("<input id='" + varId + "_input' type='number' class='inputVar' min=0 required onkeydown='limitNumbers(this, 20);' onkeyup='limitNumbers(this, 20);'/>");
			} else
				newInputVar = $("<input id='" + varId + "_input' type='" + varObj.type + "' class='inputVar' required/>");
		}
		else
			newInputVar = $("<input type='text' id='" + varId + "_input' class='inputVar date' required/>");
		newDivVar.append(newLabelInputVar);
		newDivVar.append(newInputVar);
		templateEditorForm.append(newDivVar);

		if (varObj.type == "date") {
			$("#\\" + varId + "_input").datepicker({
			//$("#" + varId + "_input").datepicker({
				minDate: new Date(),
				dateFormat: 'dd.mm.yy',
			  	onSelect: function(dateText) {
			    	setVarVal($(this), varObj);
			  	}
			});
		} else if (varObj.type == "currency") {
			$("#\\" + varId + "_input").change(function(e) {
			//$("#" + varId + "_input").change(function(e) {
				setVarVal($(this), varObj);
			});
		} else {
			$("#\\" + varId + "_input").bind('keyup mouseup',function(e) {
			//$("#" + varId + "_input").bind('keyup mouseup',function(e) {
				setVarVal($(this), varObj);
			});
		}
	}

	function showVariableInput(varObj, varId, step) {
		var inputContainer = $("#\\" + varId + "_input_container");
		//var inputContainer = $("#" + varId + "_input_container");
		if (varObj.step != step)
			inputContainer.addClass("hidden");
		else
			inputContainer.removeClass("hidden");
	}

	function activateVariableInNote(varObj, el, step) {
		if (varObj) {
			if (varObj.step == step) {
				$(el).addClass("active");
			} else {
				$(el).removeClass("active");
				if (step == 2) {
					$(el).removeClass("templateVariable");
				}
			}
		}
	}

	function setVarVal(input, varObj) {
		var inputId = input.prop("id");
		var labelId = inputId.substr(0, inputId.lastIndexOf("_"));
		if (labelId) {
			var varInContract = $("#\\" + labelId);
			//var varInContract = $("#" + labelId);
			var newVal;
			//console.log(input.val());
			if (input.val()) {
				newVal = input.val();
				input.removeClass("invalid");
				$("label[for='\\" + input.prop("id") + "']").removeClass("invalid");
				//$("label[for='" + input.prop("id") + "']").removeClass("invalid");
			} else {
				newVal = varObj.defaultValue;
			}

			if (varObj.type == "currencyValue") {
				varInContract.text(addRanks(newVal));
				contractVariables[labelId] = addRanks(newVal);
			} else {
				varInContract.text(newVal);
				contractVariables[labelId] = newVal;
			}
		}

		if (varObj.type == "email") {
			var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
			if (testEmail.test(newVal)) {
				for (var i = 0; i < invalidEmails.length; i++) {
					var invalidEmailObj = invalidEmails[i];
					if (invalidEmailObj.id == inputId)
						invalidEmails.splice(i, 1);
				}
			}
			else {
				var isAdded = false;
				for (var i = 0; i < invalidEmails.length; i++) {
					var invalidEmailObj = invalidEmails[i];
					if (invalidEmailObj.id == inputId) {
						isAdded = true;
						break;
					}

				}
				if (!isAdded)
					invalidEmails.push({"id": inputId});
			}
		}
	}

	function changeStepNum(increment, absolute) {
		var newStep;
		if (increment) {
			var curVal = parseInt(stepNum.val());
			newStep = curVal + increment
		} else if (absolute)
			newStep = absolute;

		stepNum.val(newStep);

		return newStep;
	}

	function drawFormForStep(stepNum) {
		//console.log(stepNum);
		var varsStruct = JSON.parse(varsStructHiddenInput.val());
		if (stepNum == 1 || stepNum == 2) {
			for (prop in varsStruct) {
		    	showVariableInput(varsStruct[prop], prop, stepNum);
		    	activateVariableInNote(varsStruct[prop], $("#\\" + prop), stepNum)
		    	//activateVariableInNote(varsStruct[prop], $("#" + prop), stepNum)
		    }
		}
	}
});

function onlyNumbers(element) {
	var elVal = $(element).val();
	if (!isNaN(parseInt(elVal.toString().split('-').join(''))))
		$(element).val(parseInt(elVal.toString().split('-').join('')));
	else
		$(element).val("");
}

function limitNumbers(element, maxNumbers) {
    var max_chars = maxNumbers;

    onlyNumbers(element);
    if(element.value.length > max_chars) {
        element.value = element.value.substr(0, max_chars);
    }
}

function addRanks(val) {
	//console.log(val);
	var valWithRanks;
	if (!isNaN(parseInt(val))) {
		var strVal = val.toString();
		strVal = strVal.split(',').join('');
		var strValArr = strVal.split('');
		var strValArrWithRanks = [];
		for (var i = strValArr.length - 1; i >= 0; i--) {
			if (i == strValArr.length - 1) {
				strValArrWithRanks.push(strValArr[i]);
			} else {
				if ((strValArr.length - (i + 1))%3 == 0) {
					strValArrWithRanks.unshift(",");
					strValArrWithRanks.unshift(strValArr[i]);
				} else {
					strValArrWithRanks.unshift(strValArr[i]);
				}
			}
		}
		valWithRanks = strValArrWithRanks.join('');
		return valWithRanks;
	} else {
		return val;
	}
}