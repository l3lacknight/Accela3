function voidRemoveFees(vFeeCode){
	var feeSeqArray = new Array();
	var invoiceNbrArray = new Array();
	var feeAllocationArray = new Array();
    var itemCap = capId;
    logDebug("itemCap: " + itemCap);
    if (arguments.length > 1) {
        itemCap = arguments[1];
        logDebug("itemCap: " + itemCap);
    }
 	// for each fee found
	//  	  if the fee is "NEW" remove it
	//  	  if the fee is "INVOICED" void it and invoice the void
	//
	var targetFees = loadFees(itemCap);
	logDebug("targetFees: " + targetFees);

	for (tFeeNum in targetFees) {
		targetFee = targetFees[tFeeNum];
		logDebug("targetFee: " + targetFee);
		logDebug("tFeeNum: " + tFeeNum);
		logDebug("targetFee.code: " + targetFee.code);
		//if (targetFee.code.equals(vFeeCode)) { // only remove invoiced or new fees, however at this stage all AE fees should be invoiced.
			logDebug("Checking for INVOICED or NEW status");
			if (targetFee.status == "INVOICED") {
				var editResult = aa.finance.voidFeeItem(itemCap, targetFee.sequence);
				if (editResult.getSuccess()){
					logDebug("Voided existing Fee Item: " + targetFee.code);
				}
				else { 
					logDebug( "**ERROR: voiding fee item (" + targetFee.code + "): " + editResult.getErrorMessage());
					return false;
				}

				var feeSeqArray = new Array();
				var paymentPeriodArray = new Array();

				feeSeqArray.push(targetFee.sequence);
				paymentPeriodArray.push(targetFee.period);
				var invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);

				if (!invoiceResult_L.getSuccess()) {
					logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
					return false;
				}
			}
			if (targetFee.status == "NEW") { // delete the fee
				var editResult = aa.finance.removeFeeItem(itemCap, targetFee.sequence);
				if (editResult.getSuccess()) {
					logDebug("Removed existing Fee Item: " + targetFee.code);
				}
				else {
					logDebug( "**ERROR: removing fee item (" + targetFee.code + "): " + editResult.getErrorMessage());
					return false;
				}
			
				logDebug("This fee doesn't have INVOICED or NEW status");}
		} // each matching fee
	}  // each  fee
}  // function