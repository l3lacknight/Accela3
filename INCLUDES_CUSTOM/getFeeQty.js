function getFeeQty(FeeCode) {
	var feeA = loadFees(capId);
	var tmpFeeTotQty = 0;

	for (x in feeA){
		thisFee = feeA[x];

		if (thisFee.code == FeeCode && (thisFee.status == "INVOICED" || thisFee.status == "NEW")){
			tmpFeeTotQty = tmpFeeTotQty + thisFee.unit;
		}
	}
	return tmpFeeTotQty;
}