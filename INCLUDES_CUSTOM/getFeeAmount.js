function getFeeAmount(FeeCode) {
	var feeA = loadFees(capId);
	var tmpFeeTotAmount = 0;

	for (x in feeA){
		thisFee = feeA[x];

		if (thisFee.code == FeeCode && (thisFee.status == "INVOICED" || thisFee.status == "NEW")){
			tmpFeeTotAmount = tmpFeeTotAmount + thisFee.amount;
		}
	}
	return tmpFeeTotAmount;
}