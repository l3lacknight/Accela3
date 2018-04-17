function updateRecordRelation(recA, recB, mod) {
	var capA = aa.cap.getCapID(recA).getOutput()
	var capB = aa.cap.getCapID(recB).getOutput()
	if (capA == null || capB == null ) {
		logDebug("Cannot update relation between "+recA+" and "+recB+" because they do not both exist")
		return false
	}
	switch((""+mod).toUpperCase()) {
	case "ADDITION":
		linkResult = aa.cap.createAppHierarchy(capA, capB);
		return linkResult.getSuccess()
	case "REMOVE":
		linkResult = aa.cap.removeAppHierarchy(capA, capB);
		return linkResult.getSuccess()
	}
	return false
}