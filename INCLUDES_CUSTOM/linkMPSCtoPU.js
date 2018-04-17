function linkMPSCtoPU(licNum, appCapId) {
	refMPSC = null;
	var licResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licNum);
	if (licResult.getSuccess()) {
		var tmp = licResult.getOutput();
		if (tmp != null) {
			for (lic in tmp) {
				if ( ("" + tmp[lic].getLicenseType() == "Carrier") ) {
					refMPSC = tmp[lic];
					break;
				}
			}
		}
	}
	if (refMPSC == null) { logDebug("No ref lp found " + licNum); return; }
	
	appCap = aa.cap.getCap(appCapId).getOutput();
	createdBy = "";
	if (appCap && appCap.isCreatedByACA()) {
		appCapDetailObjResult = aa.cap.getCapDetail(appCapId);		
		if (appCapDetailObjResult.getSuccess()) {
			appCapDetailObj = appCapDetailObjResult.getOutput();
			createdBy = appCapDetailObj.getCreateBy();
		}
		if (createdBy.indexOf("PUBLIC") == 0) {
			puResult = aa.publicUser.getPublicUserByPUser(createdBy);
			if (puResult.getSuccess()) {
				pu = puResult.getOutput();
				if (pu!=null) {
					assocResult = aa.licenseScript.associateLpWithPublicUser(pu, refMPSC);
					if (assocResult.getSuccess()) 
						logDebug("Successfully linked ref lp to public user account");
					else
						logDebug("Link failed " + assocResult.getErrorMessage());
				}
				else { logDebug("public user is null"); }
			}
			else { logDebug("Error getting public user " + puResult.getErrorMessage()); }
		}
		else { logDebug("No public user to link to"); }
	}
	else { logDebug("Record not created by ACA - no public user"); }
}