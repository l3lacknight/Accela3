function processRenewalPayment() {
	var capID = getCapId();
	var partialCapID = getPartialCapID(capID);
	var parentLicenseCAPID = getParentLicenseCapID(capID)
	if (parentLicenseCAPID != null) {
		logDebug("Parent CAP ID :" + parentLicenseCAPID);
		// 2. Check to see if license is ready for renew, and check for full paying 
		//if (isReadyRenew(parentLicenseCAPID) && isRenewalCap(capID) && (checkFullPaying(capID)=="true")) {
		if (isReadyRenew(parentLicenseCAPID) && isRenewalCap(capID)) {
			if (isRenewalCompleteOnPayment(capID)) {
				//3. Associate current CAP with parent license CAP.
				var result = aa.cap.updateRenewalCapStatus(parentLicenseCAPID, capID);
				if (result.getSuccess()) {
					projectScriptModel = result.getOutput();
					aa.cap.updateAccessByACA(capID, "N");			
					if (projectScriptModel.RENEWAL_COMPLETE.equals(projectScriptModel.getStatus())) {
						if (activeLicense(parentLicenseCAPID)) {
							copyKeyInfo(capID, parentLicenseCAPID);
							aa.cap.transferRenewCapDocument(partialCapID, parentLicenseCAPID, true);
							logDebug("Transfer document for renew cap. Source Cap: " + partialCapID + ", target Cap:" + parentLicenseCAPID);
		
							//5.1.3. Send auto-issurance license email to public user
						//	if (sendLicEmails) aa.expiration.sendAutoIssueLicenseEmail(parentLicenseCAPID);
						//	logDebug("send auto-issuance license email to citizen user.");
							aa.env.setValue("isAutoIssuanceSuccess", "Yes");
						}
						logDebug("CAP(" + parentLicenseCAPID + ") renewal is complete.");
					}
					else {
						//Send new license application notice agency user for approval
					//	if (sendLicEmails) aa.expiration.sendNoAutoIssueLicenseEmail(parentLicenseCAPID);
					//	logDebug("send no-auto-issuance license email to citizen user and agency user.");
						logDebug("CAP(" + parentLicenseCAPID + ") is ready for review.");
					}
				}	
				else { logDebug("ERROR: Failed to create renewal CAP : MasterCAP(. " + parentLicenseCAPID + ")  renewal CAP(" + capID + ")" + result.getErrorMessage()); }
			}
			else {
				var reviewResult = aa.cap.getProjectByChildCapID(capID, "Renewal", "Incomplete");
				if(reviewResult.getSuccess()) {
					projectScriptModels = reviewResult.getOutput();
					projectScriptModel = projectScriptModels[0];
					projectScriptModel.setStatus("Review");
					var updateResult = aa.cap.updateProject(projectScriptModel);
					if (updateResult.getSuccess()) {
						logDebug("Updated project status to review");
					}
					else { logDebug("Error updating project status to review: " + updateResult.getErrorMessage()); }
				}
				else { logDebug("Error getting Project By Child CapID"); }
			}
		}
	}
	else { logDebug("Parent CapID is null"); }
}