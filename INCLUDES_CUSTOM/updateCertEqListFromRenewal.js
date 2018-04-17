function updateCertEqListFromRenewal(){
	logDebug("Trying to get cap id from Renewal");
	var capID = getCapId();
	
	
	var capResult = aa.cap.getCap(capID);
	if (capResult.getSuccess()) {
		var authCap = capResult.getOutput();
	}
	
	logDebug("Renewal capID: "+capID);
	logDebug("Trying to get cap id of carriers Certificate of Authority");
	var result = aa.cap.getProjectByChildCapID(capID, "Renewal", "Complete");
	if(result.getSuccess()){
		projectScriptModels = result.getOutput();
		projectScriptModel = projectScriptModels[0];
		var cCapID = projectScriptModel.getProjectID();
		var aCapID = aa.cap.getCap(cCapID).getOutput();
	}
	
	if (cCapID != null) {
		var aAltId = aCapID.getCapModel().getAltID();
		logDebug("Found Certificate of Authority: "+aAltId);
		logDebug("Replacing Eq List on Certificate with Eq List from Renewal");
		removeASITable("EQUIPMENT LIST", cCapID);
		copyASITables(capId, cCapID);
		
		//get expiration date from Certificate of Authority
		var expResult = aa.expiration.getLicensesByCapID(cCapID);
		if(expResult.getSuccess()){
			thisExp = expResult.getOutput();
			var authExpDate = thisExp.getExpDate();
			var aYear = parseInt(authExpDate.getYear());
		}

		//update Attr Intrastate Authority Expiration Date
		
		var aCapStatus = aCapID.getCapStatus(); logDebug("aCapStatus: "+aCapStatus);
		if(!matches(aCapStatus,"Active","Temporarily Discontinued")){
			//update auth status
			updateAppStatus("Active","",cCapID);
			//update Attr Intrastate Authority Status
			editRefLicProfAttribute(aAltId, "INTRASTATE AUTHORITY STATUS", "Active");
			//update Attr Intrastate Authority Status Date
			editRefLicProfAttribute(aAltId, "INTRASTATE AUTHORITY STATUS DA", dateAdd(null, 0));
			//update expiration
			editRefLicProfAttribute(aAltId,"INTRASTATE AUTHORITY EXPIRATIO","12/31/"+aYear);
			//get ref lp
			var cLic = getRefLicenseProf(aAltId);
			if(cLic){
				//update InsuranceCo
				cLic.setInsuranceCo("Active");
				//update ACAPermission
				cLic.setAcaPermission(null);//the system interprets null as Y (this will display in ACA)
			}
		}else{
			//update Attr Intrastate Authority Status
			editRefLicProfAttribute(aAltId, "INTRASTATE AUTHORITY STATUS", aCapStatus);
			//update expiration
			editRefLicProfAttribute(aAltId,"INTRASTATE AUTHORITY EXPIRATIO","12/31/"+aYear);
			//get ref lp
			var cLic = getRefLicenseProf(aAltId);
			if(cLic){
				//update InsuranceCo
				cLic.setInsuranceCo(aCapStatus);
				//update ACAPermission
				cLic.setAcaPermission(null);//the system interprets null as Y (this will display in ACA)
			}
		}
		//write ref lp update and replace trans lp on cert
		modifyRefLPAndSubTran(cCapID, cLic);
		
		
	}else{
		logDebug("Did not find Certificate of Authority for Renewal");
	}
}