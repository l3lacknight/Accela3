function doesRecordExist(appNum) {
	var getCapResult = aa.cap.getCapID(appNum);
	if (getCapResult.getSuccess()) {
		var resObj = getCapResult.getOutput();
		if (resObj != null) return true;
	}
	return false;
}