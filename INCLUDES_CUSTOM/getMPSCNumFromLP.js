function getMPSCNumFromLP() {
	var retValue = null;
	var licProfResult = aa.licenseProfessional.getLicensedProfessionalsByCapID(capId);
	if (licProfResult.getSuccess()) {
		licProf = licProfResult.getOutput();
		if (licProf != null) {
			for (lpIndex in licProf) {
				thisLP = licProf[lpIndex];
				if (("" + thisLP.getLicenseType()) == "Carrier") {
					return "" + thisLP.getLicenseNbr();
				}
			}
		}
	}
	else { 
		logDebug("Error getting lps on record " + licProfResult.getErrorMessage());
	}
	return retValue;
}