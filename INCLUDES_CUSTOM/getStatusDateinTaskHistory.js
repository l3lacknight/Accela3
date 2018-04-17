function getStatusDateinTaskHistory(tName, sName) {
	histResult = aa.workflow.getWorkflowHistory(capId, tName, null);
	if (histResult.getSuccess()) {
		var taskHistArr = histResult.getOutput();
		taskHistArr.sort(compareStatusDateDesc);
		for (var xx in taskHistArr) {
			taskHist = taskHistArr[xx];
			statusDate = taskHist.getStatusDate();
			//aa.print(taskHist.getDisposition() + ":" + statusDate);
			if ( (""+ taskHist.getDisposition()) == sName)
				return statusDate;
		}
	}
	return null;
}