function doesStatusExistInTaskHistory(tName, tStatus) {

	histResult = aa.workflow.getWorkflowHistory(capId, tName, null);
	if (histResult.getSuccess()) {
		var taskHistArr = histResult.getOutput();
		var found = 0;
		for (var xx in taskHistArr) {
			taskHist = taskHistArr[xx];
			if (tStatus.equals(taskHist.getDisposition()))
				found++;
		}
		if (found > 1) return true;
		return false;
		
	}
	else {
		logDebug("Error getting task history : " + histResult.getErrorMessage());
	}
	return false;
}