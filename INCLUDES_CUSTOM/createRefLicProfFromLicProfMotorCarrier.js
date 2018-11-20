function createRefLicProfFromLicProfMotorCarrier(){
	//get lp tab from record
	var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
	//check success
	if(capLicenseResult.getSuccess()){
		//get list of lp objs 
		var capLicenseArr = capLicenseResult.getOutput();
	}else{ 
		logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); 
		return false;
	}
	//check if lp obj list is empty
	if(!capLicenseArr.length){
		logDebug("WARNING: no license professional available on the application:"); 
		return false; 
	}
	//get lp obj from list, assumes only 1 lp obj
	var licProfScriptModel = capLicenseArr[0];
	//get lp model from lp obj
	var licModel = licProfScriptModel.getLicenseProfessionalModel();
	//get license number from lp obj
	var tlpId = licProfScriptModel.getLicenseNbr(); 
	logDebug("Current transactional license number " + tlpId);
	//get TSI
	var existingCarrier = getTaskSpecific("Application Review", "This Application is for a Carrier with an existing MPSC#");

	if(matches(existingCarrier,"No","N")){
		logDebug("Creating new reference lp");
		// create new Ref Lp
		var newLic = aa.licenseScript.createLicenseScriptModel();
		// replace lic number with number from Agency mask
		sessID = getSessionID();
		nextNumber = getNextMaskedSeq(sessID, "MPSC Number Mask", "MPSC Number Sequence", "Agency");
		var rlpId = nextNumber;
		logDebug("New license number = " + nextNumber);
	}else{
		var existingCarrierNum = getTaskSpecific("Application Review", "MPSC#");
		logDebug("Updating existing reference LP (carrier): " + existingCarrierNum);
		var rlpId = existingCarrierNum;
		//get existing ref LP
		var newLic = getRefLicenseProf(existingCarrierNum);
	}

	if(matches(existingCarrier,"No","N")){
		newLic.setStateLicense(nextNumber);
		newLic.setAcaPermission("N");
	}
	newLic.setAddress1(licProfScriptModel.getAddress1());
	newLic.setAddress2(licProfScriptModel.getAddress2());
	newLic.setAddress3(licProfScriptModel.getAddress3());
	newLic.setContactFirstName(licProfScriptModel.getContactFirstName());
	newLic.setContactLastName(licProfScriptModel.getContactLastName());
	newLic.setContactMiddleName(licProfScriptModel.getContactMiddleName());
	newLic.setAgencyCode(licProfScriptModel.getAgencyCode());
	newLic.setAuditDate(licProfScriptModel.getAuditDate());
	newLic.setAuditID(licProfScriptModel.getAuditID());
	newLic.setAuditStatus(licProfScriptModel.getAuditStatus());
	newLic.setBusinessLicense(licProfScriptModel.getBusinessLicense());
	newLic.setBusinessName(licProfScriptModel.getBusinessName());
	newLic.setCity(licProfScriptModel.getCity());
	newLic.setCityCode(licProfScriptModel.getCityCode());
	newLic.setCountryCode(licProfScriptModel.getCountryCode());
	newLic.setCountry(licProfScriptModel.getCountry());
	newLic.setEinSs(licProfScriptModel.getEinSs());
	newLic.setEMailAddress(licProfScriptModel.getEmail());
	newLic.setFax(licProfScriptModel.getFax());
	newLic.setLicenseType(licProfScriptModel.getLicenseType());
	newLic.setLicOrigIssDate(licProfScriptModel.getLicesnseOrigIssueDate());
	newLic.setPhone1(licProfScriptModel.getPhone1());
	newLic.setPhone2(licProfScriptModel.getPhone2());
	newLic.setSelfIns(licProfScriptModel.getSelfIns());
	newLic.setState(licProfScriptModel.getState());
	newLic.setLicState("MI");
	newLic.setSuffixName(licProfScriptModel.getSuffixName());
	newLic.setZip(licProfScriptModel.getZip());
	newLic.setFein(licProfScriptModel.getFein());
	newLic.setSocialSecurityNumber(licProfScriptModel.getSocialSecurityNumber());
	newLic.setMaskedSsn(licProfScriptModel.getMaskedSsn());
	//newLic.setLicenseBoard(licProfScriptModel.getLicenseBoard());
	newLic.setBusinessName2(licProfScriptModel.getBusName2());
	newLic.setComment(licProfScriptModel.getComment());
	
	/* ASI to Ref LP object*/
	if(AInfo["Worker's Compensation Exempt"] != null){
		if(AInfo["Worker's Compensation Exempt"] == "Yes" || AInfo["Worker's Compensation Exempt"] == "Y") 
			newLic.setWcExempt("Y");
		else
			newLic.setWcExempt("N");
	}
	if(AInfo["Operation Type"] != null){
		newLic.setLicenseBoard(AInfo["Operation Type"]);
	}
	
	//create new ref lp or update existing ref lp
	if(matches(existingCarrier,"No","N")){
		myResult = aa.licenseScript.createRefLicenseProf(newLic);
		if(myResult.getSuccess()){
			logDebug("Successfully created ref lic prof");
		}else{
			logDebug("Error creating reference lp: " + myResult.getErrorMessage());
			return false;
		}
	}else{
		var myResult = aa.licenseScript.editRefLicenseProf(newLic);
		if(myResult.getSuccess()){
			logDebug("Successfully updated reference lp standard fields");
		}else{
			logDebug("Error updating reference lp standar fields: " + myResult.getErrorMessage());
			return false;
		}
	}

	/* Trans LP Template to Ref LP Template */
	attrList = licProfScriptModel.getAttributes()
	for( i in attrList ){
		thisAttr = attrList[i]
		name = ""+thisAttr.getAttributeName(); val="";
		// Exclude fields updated by ASI
		if( !matches(name,"AUTO TRANSPORT","HAZ MAT CARRIER", "HOUSEHOLD GOODS AUTHORITY", "PORTABLE STORAGE UNITS", "CONTINUOUS CONTRACT")) {
			val = ""+thisAttr.getAttributeValue()
			editRefLicProfAttribute(rlpId,name,val == "null" ? null : val)
		}

	}

	/* ASI to Ref LP Template */
	if(AInfo["Auto Transport"] != null) 
		editRefLicProfAttribute(rlpId,"AUTO TRANSPORT",AInfo["Auto Transport"])
	if(AInfo["Hazardous Material"] != null) 
		editRefLicProfAttribute(rlpId,"HAZ MAT CARRIER",AInfo["Hazardous Material"])
	if(AInfo["Household Goods Authority"] != null) 
		editRefLicProfAttribute(rlpId,"HOUSEHOLD GOODS AUTHORITY",AInfo["Household Goods Authority"])
	if(AInfo["Continuous Contract"] != null) 
		editRefLicProfAttribute(rlpId,"CONTINUOUS CONTRACT",AInfo["Continuous Contract"])
	if(AInfo["Portable Storage Units"] != null) 
		editRefLicProfAttribute(rlpId,"PORTABLE STORAGE UNITS",AInfo["Portable Storage Units"]);
	
	//Replace the trans LP on the app with the new Ref LP
	removeCapLPs(capId);
	addRefLpToCap(newLic,capId);
	
	return rlpId;
}