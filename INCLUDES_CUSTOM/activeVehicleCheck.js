function activeVehicleCheck(){
	if(wfTask == "Certification" && wfStatus == "Issued"){
		equipTable = loadASITable("EQUIPMENT LIST");
		var iaVehicles = 0;
		iaVehicles = countASITRows(equipTable, "Status", "EXCLUDE", "Active")//CG 12.17.2015 -- optional parameters = cName, filterType, cValue, cName2, filterType2, cValue2
		if(iaVehicles > 0){
			var iavmsg = "There is "+iaVehicles+" vehicle(s) not set to ACTIVE. Canceled Issuance, please update ASIT.";
			logDebug(iavmsg);
			showMessage = true;
			comment(iavmsg);
			cancel = true;
		}
	}
}