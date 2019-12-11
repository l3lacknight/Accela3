function updateCertEqListFromRenewal(){
	logDebug("Trying to get cap id from Renewal");
	var capID = getCapId();
	
	
	var capResult = aa.cap.getCap(capID);
	if (capResult.getSuccess()) {
		logDebug("capResult.getSuccess() was successful. capResult: " + capResult);
		var authCap = capResult.getOutput();
	}
	
	logDebug("Renewal capID: "+capID);
	logDebug("Trying to get cap id of carriers Certificate of Authority");
	var result = aa.cap.getProjectByChildCapID(capID, "Renewal", "Complete");
	var result2 = aa.cap.getProjectByChildCapID(capID, "Renewal", "Incomplete");
	var result3 = aa.cap.getProjectByChildCapID(capID, "Renewal", "Review");
	if(result.getSuccess()){
							logDebug("COMPLETE PARAMETER PASSED AND ACCEPTED") 
							logDebug("getProjectByChildCapID "+capID + " was successful. Result: " + result);
		projectScriptModels = result.getOutput();
							logDebug("projectScriptModels: "+projectScriptModels);
		projectScriptModel = projectScriptModels[0];
							logDebug("projectScriptModel: "+projectScriptModel);
		var cCapID = projectScriptModel.getProjectID();
							logDebug("cCapID: "+cCapID);
		var aCapID = aa.cap.getCap(cCapID).getOutput();
							logDebug("aCapID: "+aCapID);
	}
	if(result2.getSuccess()){
							logDebug("INCOMPLETE PARAMETER PASSED AND ACCEPTED") 
							logDebug("getProjectByChildCapID "+capID + " was successful. Result2: " + result2);
		projectScriptModels = result2.getOutput();
							logDebug("projectScriptModels: "+projectScriptModels);
		projectScriptModel = projectScriptModels[0];
							logDebug("projectScriptModel: "+projectScriptModel);
		var cCapID = projectScriptModel.getProjectID();
							logDebug("cCapID: "+cCapID);
		var aCapID = aa.cap.getCap(cCapID).getOutput();
							logDebug("aCapID: "+aCapID);
	}
	if(result3.getSuccess()){
							logDebug("REVIEW PARAMETER PASSED AND ACCEPTED") 
							logDebug("getProjectByChildCapID "+capID + " was successful. Result3: " + result3);
		projectScriptModels = result3.getOutput();
							logDebug("projectScriptModels: "+projectScriptModels);
		projectScriptModel = projectScriptModels[0];
							logDebug("projectScriptModel: "+projectScriptModel);
		var cCapID = projectScriptModel.getProjectID();
							logDebug("cCapID: "+cCapID);
		var aCapID = aa.cap.getCap(cCapID).getOutput();
							logDebug("aCapID: "+aCapID);
	}

	
	if (cCapID != null) {
		var aAltId = aCapID.getCapModel().getAltID();
							logDebug("Found Certificate of Authority: "+aAltId);
							logDebug("Replacing Eq List on Certificate with Eq List from Renewal");
		removeASITable("EQUIPMENT LIST", cCapID);
		copyASITables(capId, cCapID);
							logDebug("Replacing Eq List on " +cCapID+ " with Eq List from " +capId);
		
		//get expiration date from Certificate of Authority
		var expResult = aa.expiration.getLicensesByCapID(cCapID);
		logDebug("expResult: "+expResult);
		if(expResult.getSuccess()){
			thisExp = expResult.getOutput();
								logDebug("thisExp: "+thisExp);
			var authExpDate = thisExp.getExpDate();
								logDebug("authExpDate: "+authExpDate);
			var aYear = parseInt(authExpDate.getYear());
								logDebug("aYear: "+aYear);
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

			//AM-156
			if(AInfo["Non Consent Towing"] != null){
				editRefLicProfAttribute(aAltId,"NON CONSENT TOWING",AInfo["Non Consent Towing"]);	
			}
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
			
			//AM-156
			if(AInfo["Non Consent Towing"] != null){
			editRefLicProfAttribute(aAltId,"NON CONSENT TOWING",AInfo["Non Consent Towing"]);
			}
			
			//get ref lp
			var cLic = getRefLicenseProf(aAltId);
			if(cLic){
				//update InsuranceCo
				cLic.setInsuranceCo(aCapStatus);
				//update ACAPermission
				cLic.setAcaPermission(null);//the system interprets null as Y (this will display in ACA)
			}
		}

	  //AM-167
	    logDebug("BEFORE ADDRESS CHANGES");
	    var capLPResult = aa.licenseScript.getLicenseProf(capId);
		if(capLPResult.getSuccess())
		{
			capLPArr = capLPResult.getOutput();
			if(capLPArr.length)
			{
				for(i=0;i<capLPArr.length;i++)
				{
					var licProfScriptModel = capLPArr[i];
					var lPCount = i+1;
					logDebug("------------------------ Info for Cap LP #"+lPCount)
					logDebug("getAddress1(): "+licProfScriptModel.getAddress1())
					logDebug("getAddress2(): "+licProfScriptModel.getAddress2())
					logDebug("getCity(): "+licProfScriptModel.getCity())
					logDebug("getState(): "+licProfScriptModel.getState())
					logDebug("getZip(): "+licProfScriptModel.getZip())
					logDebug("getPhone1(): "+licProfScriptModel.getPhone1())
					logDebug("getFax(): "+licProfScriptModel.getFax())
					logDebug("getEmail(): "+licProfScriptModel.getEmail())
					addrLine1 = licProfScriptModel.getAddress1();
					addrLine2 = licProfScriptModel.getAddress2();
					city = licProfScriptModel.getCity();
					st = licProfScriptModel.getState();
					zip = licProfScriptModel.getZip();
					cPhone = licProfScriptModel.getPhone1();
					cFax = licProfScriptModel.getFax();
					cEmail = licProfScriptModel.getEmail();
					logDebug("Declare Variables");
					
					logDebug(addrLine1);
					logDebug(addrLine2);
					logDebug(city);
					logDebug(st);
					logDebug(zip);
					logDebug(cPhone);
					logDebug(cFax);
					logDebug(cEmail);
					logDebug("cLic " +cLic);
					
					/*if (addrLine1 && addrLine1 != "")*/ cLic.setAddress1(addrLine1);
					/*if (addrLine2 && addrLine2 != "")*/ cLic.setAddress2(addrLine2); //address line 2 can be removed from the Certificate of Authority and Ref LP
					/*if (city && city!= "")*/ cLic.setCity(city);
					/*if (st && st!="")*/ cLic.setState(st);
					/*if (zip && zip != "")*/ cLic.setZip(zip);
					/*if (cPhone && cPhone != "")*/ cLic.setPhone1(cPhone);
					/*if (cFax && cFax != "")*/ cLic.setFax(cFax); //Fax number can be removed from the Certificate of Authority and Ref LP
					/*if (cEmail && cEmail != "")*/ cLic.setEMailAddress(cEmail);
					removeCapAddresses(cCapID);
					logDebug("Remove Cap addresses");
					copyAddresses(capId, cCapID);
					logDebug("COPIED ADDRESS INFO SUCCESSFULLY");
					
					//write ref lp update and replace trans lp on cert
					modifyRefLPAndSubTran(cCapID, cLic);
				}
			}else{
				logDebug("WARNING: no license professional available on the application:");
				 }
		}else{ 
	logDebug("**ERROR: getting Cap LP: " + capLPResult.getErrorMessage());
			  }
	}else{
		logDebug("Did not find Certificate of Authority for Renewal");
	}
}