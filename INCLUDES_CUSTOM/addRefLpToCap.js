function addRefLpToCap(refLpId,capId){
	capListResult = aa.licenseScript.associateLpWithCap(capId,refLpId);
	if (capListResult.getSuccess()) {
		logDebug("Successfully associated ref LP with record")
	}
	else {
		logDebug("Error associating ref lp with record " + capListResult.getErrorMessage())
	}
}