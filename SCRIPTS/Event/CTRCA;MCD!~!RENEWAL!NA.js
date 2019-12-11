										logDebug("BEGINNING OF CTRCA 4 RENEWAL")
var authCapId = getParentLicenseCapID(capId);
										logDebug("AFTER getParentLicenseCapID(capId)")
										logDebug("authCapId:" + authCapId)
										logDebug("capId:" + capId)
		
										logDebug("BEFORE convertRenewalToReal()")
convertRenewalToReal();
										logDebug("AFTER convertRenewalToReal()")
		
										logDebug("BEFORE !publicuser if statement")
if (!publicUser)
{
										logDebug("INSIDE !publicuser if statement")
										logDebug("BEFORE assessRenewalDecalFee()")
	assessRenewalDecalFee();
										logDebug("AFTER assessRenewalDecalFee()")
			
										logDebug(authCapId)
										logDebug("BEFORE authCapId if statement")
	if(authCapId)
	{
										logDebug("INSIDE authCapId if statement")
										logDebug("BEFORE assessRenewalLateFees(authCapId)")
		assessRenewalLateFees(authCapId);
										logDebug("AFTER assessRenewalLateFees(authCapId)")
	}

}
										logDebug("END OF CTRCA 4 RENEWAL")
		//
		//if(feeExists("RENEWAL") == false){
		//updateFee("RENEWAL","MCD_AUTH_RENEW","FINAL",1,"Y");
		//}


