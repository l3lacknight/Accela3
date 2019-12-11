										logDebug("BEGINNING OF WTUA 4 RENEWAL")
if((wfTask == "Application Review" && wfStatus == "Approved - Update Fees")||( wfTask == "Issuance" && wfStatus == "Approved - Pending Fee Adjustment")){
										logDebug("INSIDE 1ST wfTask if statement")
										logDebug("BEFORE assessRenewalDecalFee()")
	assessRenewalDecalFee();
										logDebug("AFTER assessRenewalDecalFee()")
}

if(matches(wfStatus, "Approved - Complete", "Complete"))
{
										logDebug("INSIDE 2ND wfTask if statement")
										logDebug("BEFORE completeRenewalOnWorkflow()")
	completeRenewalOnWorkflow();
										logDebug("AFTER completeRenewalOnWorkflow()")
										logDebug("BEFORE updateCertEqListFromRenewal()")
	//Now updates equipment list and non consent towing field AM-156
	//Now updates the physical address AM-167									
	updateCertEqListFromRenewal();
										logDebug("AFTER updateCertEqListFromRenewal()")	
}

else if(matches(wfStatus, "Dismissed", "Withdrawn"))
{
										logDebug("INSIDE 2ND wfTask elseif statement")
										logDebug("BEFORE completeRenewalOnWorkflow()")
	completeRenewalOnWorkflow();
										logDebug("AFTER completeRenewalOnWorkflow()")
}
										logDebug("END OF WTUA 4 RENEWAL")