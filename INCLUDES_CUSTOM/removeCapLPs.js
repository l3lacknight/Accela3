function removeCapLPs(capId){
	var capLicenseResult = aa.licenseProfessional.getLicenseProf(capId);
	var capLicenseArr = new Array();
	if(capLicenseResult.getSuccess()){
		capLicenseArr = capLicenseResult.getOutput();
	}
	if(capLicenseArr != null){
		for(capLic in capLicenseArr){
			aa.licenseProfessional.removeLicensedProfessional(capLicenseArr[capLic]);
		}
	}
}