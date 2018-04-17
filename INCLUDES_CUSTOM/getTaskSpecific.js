function getTaskSpecific(wfName,itemName){ // optional: itemCap
	var i=0;
	itemCap = capId;
	if(arguments.length == 4){// use cap ID specified in args
		itemCap = arguments[3];
	}
	var workflowResult = aa.workflow.getTasks(itemCap);
	if (workflowResult.getSuccess()){// Get the workflows
		var wfObj = workflowResult.getOutput();
	}
	else{
		logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}
	for (i in wfObj) {// Loop through workflow tasks
		fTask = wfObj[i];
		stepnumber = fTask.getStepNumber();
		processID = fTask.getProcessID();
		if (wfName.equals(fTask.getTaskDescription())) { // Found the right Workflow Task
			TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap,processID,stepnumber,itemName);
			if (TSIResult.getSuccess()) {
				var TSI = TSIResult.getOutput();
				if (TSI != null) {
					var TSIArray = new Array();
					TSInfoModel = TSI.getTaskSpecificInfoModel();
					var itemValue = TSInfoModel.getChecklistComment();
					return itemValue;
				}
				else
					logDebug("No task specific info field called "+itemName+" found for task "+wfName);
			}
			else {
				logDebug("**ERROR: Failed to get Task Specific Info objects: " + TSIResult.getErrorMessage());
				return false;
			}
		}
	}
}