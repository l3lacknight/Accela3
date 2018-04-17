function assessRenewalLateFees(authCapId){
	//get expiration date from Certificate of Authority
	var expResult = aa.expiration.getLicensesByCapID(authCapId);
	if(expResult.getSuccess()){
		thisExp = expResult.getOutput();
		var authExpDate = thisExp.getExpDate();
		
		//get the the expiration year
		var authExpYear = parseInt(authExpDate.getYear());
		logDebug("authExpYear: "+authExpYear);
		
		//get todays date
		var tDate = new Date();
		logDebug("tDate: "+tDate);
		
		//get current year
		var tYear = tDate.getFullYear();
		logDebug("tYear: "+tYear);
		
		//get current month
		var tMonth = tDate.getMonth()+1;
		logDebug("tMonth: "+tMonth);
		
		//get current date
		var tDayDate = tDate.getDate();
		logDebug("tDayDate: "+tDayDate);
		
		if(authExpYear == tYear && tMonth == 12 && tDayDate > 1 ){
			updateFee("LATEFEE", "MCD_AUTH_RENEW", "FINAL", 1, "Y");
		}else if(authExpYear == tYear-1){
			updateFee("LATEFEE", "MCD_AUTH_RENEW", "FINAL", 1, "Y");
			updateFee("PENALTY", "MCD_AUTH_RENEW", "FINAL", tMonth, "Y");
		}else{
			logDebug("Renewal is not Late.");
		}
	}else{
		logDebug("Could not get Certificate of Authority to check expiration date for late fees");
		return;
	}
}