if(wfTask == "Application Review" && matches(wfStatus,"Accepted","Incomplete Notice 1")){
	if(doCreateRefLP()){
		createRefLicProfFromLicProfMotorCarrier();
	}
}

if((wfTask == "Compliance Review" && wfStatus == "Compliance Approved") || (wfTask == "Certification" && wfStatus == "Approved/Fees Due")){
	assessDecalFee();
	logDebug("wfDateMMDDYYYY = " +wfDateMMDDYYYY);
	var wfsm = new Date(wfDateMMDDYYYY).getMonth()+1;
	logDebug("wfsm value: " +wfsm);
	if(matches(wfsm,10,11)){
		var anyrdf = assessNextYearRenewalDecalFees();
		if(anyrdf){
			logDebug("Decal and Auto Renewal Fees successfully updated on application");
		}
	}
}

if(wfTask == "Certification" && wfStatus == "Issued"){
	updateRefLpFromTransLp();
	createCertOfAuth();
	
	//AM-167
	//logDebug("BEFORE UPDATE CERT");
	//updateCert("ADDRESSCHANGE");
	//logDebug("AFTER UPDATE CERT");
	
	// test: committing via eclipse Lu 09/30
}
if (wfStatus == "Dismissed" || wfStatus == "Withdrawn"){
	logDebug ("Dismissed or withdrawn app");
	var success = voidRemoveFees();
	if(success){
		logDebug("Fees removed successfully");
	}
}