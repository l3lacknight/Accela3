function invoiceAllFees() { 

    var feeFound=false; 
    var fperiod = "STANDARD";
    getFeeResult = aa.finance.getFeeItemByCapID(capId); 
    if (getFeeResult.getSuccess()) { 
        var feeList = getFeeResult.getOutput(); 
        for (feeNum in feeList) 
			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) { 
				var feeSeq = feeList[feeNum].getFeeSeqNbr(); 
				feeSeqList.push(feeSeq); 
				paymentPeriodList.push(fperiod); 
                feeFound=true;
            } 
        } 
    else { 
    	logDebug( "**ERROR: getting fee items " + getFeeResult.getErrorMessage())
    } 
    return feeFound; 
}