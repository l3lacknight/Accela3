if(matches(wfStatus, "Approved - Update Fees", "Approved - Pending Fee Adjustment")){
	assessEquipListFee("REPLACE", "Vehicle Action", "Replacement Decal");
	assessEquipListFee("TRANSFER", "Vehicle Action", "Transfer");
	assessEquipListFee("CORRECTED", "Vehicle Action", "Corrected Cab Card");
	assessEquipListFee("DUPLICATE", "Vehicle Action", "Duplicate Cab Card");
	assessEquipListDecalFee();
}

if(matches(wfStatus, "Approved - Complete", "Complete")){
	updateCert("EQUIPLIST");
}