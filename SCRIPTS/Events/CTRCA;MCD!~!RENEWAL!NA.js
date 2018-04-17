var authCapId = getParentLicenseCapID(capId);

convertRenewalToReal();
assessRenewalDecalFee();

if(authCapId){
	assessRenewalLateFees(authCapId);
}

if(feeExists("RENEWAL") == false){
	updateFee("RENEWAL","MCD_AUTH_RENEW","FINAL",1,"Y");
}