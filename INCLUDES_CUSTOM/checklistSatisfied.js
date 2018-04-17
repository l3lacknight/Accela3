function checklistSatisfied(gName){
	var retValue = false;
	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(capId);
	if (appSpecInfoResult.getSuccess()) {
		var appspecArr = appSpecInfoResult.getOutput();

		if(appspecArr){
			retValue = true;
			for(i in appspecArr){
				var appspecItem = appspecArr[i];
				var appSpecGroup = "" + appspecItem.getCheckboxType();
				if(appSpecGroup == gName){
					if(!matches(("" + appspecItem.getChecklistComment()), "Met", "NA", "N/A", "Not Required")) 
						return false;
				}
			}
		}
	}else{
		logDebug("Error getting app spec info " + appSpecInfoResult.getErrorMessage());
	}
	return retValue;
}