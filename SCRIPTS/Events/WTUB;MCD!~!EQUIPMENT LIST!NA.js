if((wfTask == "Application Review" && wfStatus == "Approved - Complete")||(wfTask == "Issuance" && wfStatus == "Complete")){
	activeVehicleCheck();
	populateDecalNumbers();
}