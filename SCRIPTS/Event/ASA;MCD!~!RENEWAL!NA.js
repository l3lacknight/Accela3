                                        logDebug("BEGINNING OF ASA 4 RENEWAL")
var authCapId = getParentLicenseCapID(capId);
                                        logDebug("AFTER getParentLicenseCapID(capId)")
                                        logDebug("authCapId:" + authCapId)
                                        logDebug("capId:" + capId)
prepareAppForRenewal();
                                        logDebug("BEFORE assessRenewalDecalFee()")
assessRenewalDecalFee();
                                        logDebug("AFTER assessRenewalDecalFee()")
                                        logDebug("authCapId:" + authCapId)
                                        logDebug("BEFORE authCapId if statement")
if(authCapId)
    {
                                        logDebug("INSIDE authCapId if statement")
                                        logDebug("BEFORE assessRenewalLateFees(authCapId)")
        assessRenewalLateFees(authCapId);
    }
                                        logDebug("BEFORE feeExists(RENEWAL) if statement")
if(feeExists("RENEWAL") == false)
{
                                        logDebug("INSIDE feeExists(RENEWAL) if statement")
    updateFee("RENEWAL","MCD_AUTH_RENEW","FINAL",1,"Y");
}
                                        logDebug("END OF ASA 4 RENEWAL")
