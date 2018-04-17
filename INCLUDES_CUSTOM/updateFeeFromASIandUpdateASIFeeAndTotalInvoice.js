function updateFeeFromASIandUpdateASIFeeAndTotalInvoice(ASIField, FeeCode, FeeSchedule) {
	var ASIField;
	var FeeCode;
	var FeeSchedule;
	logDebug("updateFeeFromASI Function: ASI Field = " + ASIField + "; Fee Code = " + FeeCode + "; Fee Schedule: " + FeeSchedule);
	if (arguments.length == 3) 
		{
		ASIField = arguments[0]; // ASI Field to get the value from
		FeeCode = arguments[1]; // Fee code to update
		FeeSchedule = arguments[2]; // Fee Scheulde for Fee Code
		}
	else {
		logDebug("Not enought arguments passed to the function: updateFeeFromASIandUpdateASIFeeAndTotal");
	}
	var tmpASIQty = getAppSpecific(ASIField)
	
	//Check to see if the ASI Field has a value. If so, then check to see if the fee exists.
	if ((tmpASIQty != null) && (tmpASIQty > 0)) {
		logDebug("ASI Field: " + ASIField + " was found and has a positive value. Attempting to update fee information.");
		//If fee already exist and the amount is different than the ASIQty, void or remove it before adding the new qty.
		if (feeExists(FeeCode) && (tmpASIQty != getFeeQty(FeeCode))) {
			logDebug("Existing fee found with quanity: " + getFeeQty(FeeCode) + ". New Quantity is: " + tmpASIQty);
			voidRemoveFees(FeeCode)
			//Add the new fee from ASI quanity.
			updateFee(FeeCode,FeeSchedule,"FINAL",tmpASIQty,"Y");
			logDebug("Fee information has been modified.");
		}
		else if (feeExists(FeeCode) && (tmpASIQty == getFeeQty(FeeCode))) {
			logDebug("Existing fee found with quanity: " + getFeeQty(FeeCode) + ". New Quantity is: " + tmpASIQty + ". No changes are being made to fee.");
			}
		//No existing fee is found, add the new fee
		if (feeExists(FeeCode) != true) {
			updateFee(FeeCode,FeeSchedule,"FINAL",tmpASIQty,"Y");
			logDebug("Fee information has been modified.");
		}
	}
	//ASI Field doesn't exist or has a value <= 0.
	else {
		logDebug("ASI Field: " + ASIField + " is not found or has a value <= 0.")
		//Check to see if a fee for the ASI item exists. No fee should be present, but check anyways.
		if (feeExists(FeeCode)) {
			//Fee is found and should be voided or removed.
			voidRemoveFees(FeeCode)
		}
	}
	var feeAmount= getFeeAmount(FeeCode);

        var currCost = 0;
	if(tmpASIQty){
	       currCost = isNaN(tmpASIQty)? 0 : feeAmount/tmpASIQty;
	}
       
	editAppSpecific(ASIField+ " Cost", currCost);
	editAppSpecific(ASIField+ " Fee", feeAmount);
        editAppSpecific(ASIField+ " cost", currCost);
	editAppSpecific(ASIField+ " fee", feeAmount);
}