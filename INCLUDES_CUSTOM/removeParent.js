function removeParent(parentAppNum) {//removes the current application from the parent
	var getCapResult = aa.cap.getCapID(parentAppNum);
	if (getCapResult.getSuccess()) {
		var parentId = getCapResult.getOutput();
		var delinkResult = aa.cap.removeAppHierarchy(parentId, capId);
		if (delinkResult.getSuccess())
			logDebug("Successfully removed linked from Parent Application : " + parentAppNum);
		else
			logDebug("**ERROR: removing link from parent application parent cap id (" + parentAppNum + "): " + linkResult.getErrorMessage());
	} else {
		logDebug("**ERROR: getting parent cap id (" + parentAppNum + "): " + getCapResult.getErrorMessage())
	}
}