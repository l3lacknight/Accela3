function assessEquipListDecalFee() { //CG 12.17.2015 = GC = $100 and has half year discount, HHG = $50.
	feeAmt = 0;
	exstngFeeAmt = 0;
	feeDate = getTodayJs();
	feeYear = feeDate.getFullYear();
	feeStartDate = new Date("6/30/"+ feeYear);
	feeEndDate = new Date("11/01/"+ feeYear);
	equipTable = loadASITable("EQUIPMENT LIST");
	var gcVehicleCount = countASITRows(equipTable, "Vehicle Action", "INCLUDE", "Add Vehicle", "Equipment Use", "EXCLUDE", "Household Goods");
	var hhgVehicleCount = countASITRows(equipTable, "Vehicle Action", "INCLUDE", "Add Vehicle", "Equipment Use", "INCLUDE", "Household Goods");
	logDebug("GC Vehicle count: "+gcVehicleCount);
	logDebug("HHG Vehicle count: "+hhgVehicleCount);
	if (feeDate > feeStartDate && feeDate < feeEndDate) {
		feeAmt = gcVehicleCount*50;
	}
	else {
		feeAmt = gcVehicleCount*100;
	}
	feeAmt += (hhgVehicleCount*50);
	
	if (feeExists("DECAL") == true) {
		exstngFeeAmt = getFeeAmount("DECAL");
	}
	if (feeAmt > 0 && feeAmt != exstngFeeAmt) {
		updateFee("DECAL", "MCD_EQUIP", "FINAL", feeAmt, "Y");
	}
	if (feeExists("DECAL") == true && feeAmt <= 0) {
		voidRemoveFees("DECAL");
	}
}