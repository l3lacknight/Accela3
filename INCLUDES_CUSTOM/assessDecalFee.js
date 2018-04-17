function assessDecalFee() {
	//Application for Authority Approval date
	approvDate = getStatusDateinTaskHistory("Compliance Review", "Compliance Approved");

	if (approvDate != null) {
		var approvDateYear = 1900 + approvDate.getYear();
		var approvJSDate = new Date((approvDate.getMonth() +1) + "/" + approvDate.getDay() + "/" + approvDateYear);
	}
	//Update Equipment List Approved - Update Fees date
	updateFeesDate = getStatusDateinTaskHistory("Application Review", "Approved - Update Fees");
	
	if (updateFeesDate != null) {
		var updateFeesYear = 1900 + updateFeesDate.getYear();
		var updateFeesJSDate = new Date((updateFeesDate.getMonth() +1) + "/" + updateFeesDate.getDay() + "/" + updateFeesYear);
	}
	//Update Equipment List ASIT submit
	/*
	if (todayDate != null) {
		var todayDateYear = 1900 + todayDate.getYear();
		var todayDateJSDate = new Date((todayDate.getMonth() +1) + "/" + todayDate.getDay() + "/" + todayDateYear);
	}
	*/
	//set $50 fee date range for Application for Authority
	startJSDate = new Date("06/30/" + approvDateYear);
	endJSDate = new Date("10/31/" + approvDateYear);
	//set $50 fee date range for Update Equipment List
	startJSDate2 = new Date("06/30/" + updateFeesYear);
	endJSDate2 = new Date("10/31/" + updateFeesYear);
	//set $50 fee date range for Update Equipment List ACA
	/*
	startJSDate3 = new Date("06/30/" + todayDateYear);
	endJSDate3 = new Date("10/31/" + todayDateYear);
	*/
	feeAmt = 0;
	equipTable = loadASITable("EQUIPMENT LIST");

	if ((approvJSDate > startJSDate && approvJSDate < endJSDate) || (updateFeesJSDate > startJSDate2 && updateFeesJSDate < endJSDate2)) {
		feeAmt = ( sumASITColumn(equipTable, "Plate Fee", "EXCLUDE", "Equipment Use", "Household Goods", "INCLUDE", "Vehicle Action", "Add Vehicle") * 0.5 ) + 
			sumASITColumn(equipTable, "Plate Fee", "INCLUDE", "Equipment Use", "Household Goods", "INCLUDE", "Vehicle Action", "Add Vehicle");
	}
	else {
		feeAmt = sumASITColumn(equipTable, "Plate Fee", "INCLUDE", "Vehicle Action", "Add Vehicle");
	}
	if ((feeAmt > 0) && (approvDate != null)) {
		updateFee("DECAL", "MCD_AUTH_APP", "FINAL", feeAmt, "N");
	}
	if ((feeAmt > 0) && (updateFeesDate != null)) {
		updateFee("DECAL", "MCD_EQUIP", "FINAL", feeAmt, "N");
	}
}