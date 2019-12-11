function assessDecalFee(){
	
	var approvDateYear = null;
	var updateFeesYear = null;
	var approvJSDate = null;
	var updateFeesJSDate = null;
	
	//Application for Authority Approval date
	approvDate = getStatusDateinTaskHistory("Compliance Review", "Compliance Approved");
	logDebug("approvDate: "+approvDate);
	
	if(approvDate != null){
		approvDateYear = 1900 + approvDate.getYear();
		logDebug("approvDateYear: "+approvDateYear);
		approvJSDate = new Date((approvDate.getMonth() +1) + "/" + approvDate.getDay() + "/" + approvDateYear);
		logDebug("approvJSDate: "+updateFeesJSDate);
	}
	
	//Update Equipment List Approved - Update Fees date
	updateFeesDate = getStatusDateinTaskHistory("Application Review", "Approved - Update Fees");
	logDebug("updateFeesDate: "+updateFeesDate);
	
	if(updateFeesDate != null){
		updateFeesYear = 1900 + updateFeesDate.getYear();
		logDebug("updateFeesYear: "+updateFeesYear);
		
	    updateFeesJSDate = new Date((updateFeesDate.getMonth() +1) + "/" + updateFeesDate.getDay() + "/" + updateFeesYear);
		logDebug("updateFeesJSDate: "+updateFeesJSDate);
	}
	//set $50 fee date range for Application for Authority
	//if(approvDate != null){
		startJSDate = new Date("06/30/" + approvDateYear);
		endJSDate = new Date("11/30/" + approvDateYear);
		logDebug("startJSDate: "+startJSDate);
		logDebug("endJSDate: "+endJSDate);
	//}
	
	//set $50 fee date range for Update Equipment List
	//if(updateFeesDate != null){
		startJSDate2 = new Date("06/30/" + updateFeesYear);
		endJSDate2 = new Date("10/31/" + updateFeesYear);
		logDebug("startJSDate2: "+startJSDate2);
		logDebug("endJSDate2: "+endJSDate2);
	//}
	
	feeAmt = 0;
	equipTable = loadASITable("EQUIPMENT LIST");

	if((approvJSDate > startJSDate && approvJSDate < endJSDate) || (updateFeesJSDate > startJSDate2 && updateFeesJSDate < endJSDate2)){
		feeAmt = ( sumASITColumn(equipTable, "Plate Fee", "EXCLUDE", "Equipment Use", "Household Goods", "INCLUDE", "Vehicle Action", "Add Vehicle") * 0.5 ) + 
			sumASITColumn(equipTable, "Plate Fee", "INCLUDE", "Equipment Use", "Household Goods", "INCLUDE", "Vehicle Action", "Add Vehicle");
		logDebug("Half Year Decal Fee Amount: "+feeAmt);
	}else{
		feeAmt = sumASITColumn(equipTable, "Plate Fee", "INCLUDE", "Vehicle Action", "Add Vehicle");
		logDebug("Full Year Decal Fee Amount: "+feeAmt);
	}
	if((feeAmt > 0) && (approvDate != null)){
		logDebug("Updating Application Decal Fee: "+feeAmt);
		updateFee("DECAL", "MCD_AUTH_APP", "FINAL", feeAmt, "N");
	}
	if ((feeAmt > 0) && (updateFeesDate != null)) {
		logDebug("Updating Equipment List Decal Fee: "+feeAmt);
		updateFee("DECAL", "MCD_EQUIP", "FINAL", feeAmt, "N");
	}
}