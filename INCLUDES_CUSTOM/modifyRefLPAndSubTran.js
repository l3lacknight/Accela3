function modifyRefLPAndSubTran(itemCap, newLic) {
	myResult = aa.licenseScript.editRefLicenseProf(newLic);
	if (myResult.getSuccess()) {
		logDebug("Successfully updated reference LP");
	}
	else {
		logDebug("Error updating reference lp: " + myResult.getErrorMessage()); 
		return false;
	}
	
	// copy lic number from reference LP to transaction LP 
	var capLicenseResult = aa.licenseProfessional.getLicenseProf(itemCap);
	var capLicenseArr = new Array();
	if(capLicenseResult.getSuccess()){
		capLicenseArr = capLicenseResult.getOutput();
	}
		
	if(capLicenseArr != null){
		for(capLic in capLicenseArr){
			if(capLicenseArr[capLic].getLicenseType()+"" == newLic.getLicenseType()+""){
				aa.licenseProfessional.removeLicensedProfessional(capLicenseArr[capLic]);
				break;
			}
			
		}
	}
	capListResult = aa.licenseScript.associateLpWithCap(itemCap,newLic);
	if (capListResult.getSuccess()) {
		logDebug("Successfully associated ref LP with record")
	}
	else {
		logDebug("Error associating ref lp with record " + capListResult.getErrorMessage())
	}
}