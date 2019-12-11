function getInvoicedFeeCodes(itemCap){
	var feeCodeArray = [];
	getFeeResult = aa.fee.getFeeItemOfInvoicedByCapID(itemCap);
	if (getFeeResult.getSuccess()) {
		var feeList = getFeeResult.getOutput();
		if(feeList.length > 0){
			for (feeNum in feeList) {
				if(feeList[feeNum].getFeeitemStatus() == "INVOICED"){
					feeCodeArray.push(feeList[feeNum].getFeeCod());
				}
			}
		}else{
			logDebug("No Invoiced Fees on record");
		}
	}else{
		logDebug("Could not get fees from record");
	}
	return feeCodeArray;
}