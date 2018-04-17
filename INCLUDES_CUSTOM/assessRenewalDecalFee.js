function assessRenewalDecalFee() { //CG 12/14/2015 added function to calculate and update renewal decal fee.

	//TCH@Accela 2016-09-29 Added test for feeAmt before comparing to the exstngRnwlFeeAmt
 
    var exstngRnwlFeeAmt = 0;
    var feeAmt = 0;
    var equipTable = loadASITable("EQUIPMENT LIST");
    
    logDebug("Get fee total from ASIT");
    feeAmt = sumASITColumn(equipTable, "Plate Fee");
    logDebug("feeAmt: "+feeAmt);
 
    if (feeExists("DECAL") === true) {
    	logDebug("Found existing decal fee");
        exstngRnwlFeeAmt = getFeeAmount("DECAL");
    	logDebug("of $"+exstngRnwlFeeAmt);
    }
 
    if (feeAmt) {
        if (feeAmt !== exstngRnwlFeeAmt) {
            updateFee("DECAL", "MCD_AUTH_RENEW", "FINAL", feeAmt, "Y");
        }
    }
}