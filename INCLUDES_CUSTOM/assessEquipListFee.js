function assessEquipListFee(feeItemCode, columnName, columnValue) { //CG 12/17/2015 -- feeItemCode = the fee item code that you want to update, columnValue = the column value that is used to calculate the fee.
	exstngFeeAmt = 0;
	feeAmt = 0;
	equipTable = loadASITable("EQUIPMENT LIST");
	feeAmt = countASITRows(equipTable, columnName, "INCLUDE", columnValue);

	if (feeExists(feeItemCode) == true){
		exstngFeeAmt = getFeeAmount(feeItemCode);
	}	
	if (feeAmt > 0 && feeAmt != exstngFeeAmt) {
		updateFee(feeItemCode, "MCD_EQUIP", "FINAL", feeAmt, "Y");
	}	
	if (feeExists(feeItemCode) == true && feeAmt <= 0) {
		voidRemoveFees(feeItemCode);
	}	
}