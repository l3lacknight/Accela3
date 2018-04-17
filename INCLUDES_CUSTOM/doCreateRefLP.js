function doCreateRefLP(){
	histResult = aa.workflow.getWorkflowHistory(capId, null);
	if(histResult.getSuccess()){
		var taskHistArr = histResult.getOutput();
		var found = 0;
		for(var xx in taskHistArr){
			taskHist = taskHistArr[xx];
			var thisTaskName = taskHist.getTaskDescription();
			var thisTaskStatus = taskHist.getDisposition();
			logDebug("thisTaskName: "+thisTaskName+", has a status: "+thisTaskStatus);
			if(matches(thisTaskName,"Application Review") && matches(thisTaskStatus,"Incomplete Notice 1","Accepted")){
				found++;
				if(found > 1){
					logDebug("Count: "+found);
					return false;
				}
			}
		}
	}
	else {
		logDebug("Error getting task history : " + histResult.getErrorMessage());
	}
	return true;
}