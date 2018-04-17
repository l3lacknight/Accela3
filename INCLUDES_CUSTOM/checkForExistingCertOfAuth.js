function checkForExistingCertOfAuth(){
	var exists = false;
	mpscNum = getMPSCNumFromLP();
	if(mpscNum != null){
		var existResult = aa.cap.getCapID(mpscNum).getOutput();
		if(existResult){
			logDebug("found existing certificate of authority")
			exists = true;
		}
	}
	return exists;
}