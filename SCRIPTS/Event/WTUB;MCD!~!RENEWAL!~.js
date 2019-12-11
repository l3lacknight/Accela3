										logDebug("BEGINNING OF WTUB 4 RENEWAL")
if((wfTask == "Application Review" && wfStatus == "Approved - Complete")||(wfTask == "Issuance" && wfStatus == "Complete")){
										logDebug("INSIDE wfTask if statement")
										logDebug("BEFORE activeVehicleCheck()")
	activeVehicleCheck();
										logDebug("AFTER activeVehicleCheck()")
										logDebug("BEFORE populateDecalNumbers()")
	populateDecalNumbers();
										logDebug("AFTER populateDecalNumbers()")
}
										logDebug("END OF WTUB 4 RENEWAL")