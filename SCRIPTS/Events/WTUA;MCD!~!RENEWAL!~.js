if((wfTask == "Application Review" && wfStatus == "Approved - Update Fees")||( wfTask == "Issuance" && wfStatus == "Approved - Pending Fee Adjustment")){
	assessRenewalDecalFee();
}

if(matches(wfStatus, "Approved - Complete", "Complete")){
	completeRenewalOnWorkflow();
	updateCertEqListFromRenewal();
}else if(matches(wfStatus, "Dismissed", "Withdrawn")){
	completeRenewalOnWorkflow();
}