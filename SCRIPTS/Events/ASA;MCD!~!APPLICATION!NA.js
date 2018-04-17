if(!cap.isCreatedByACA() && getParent() != null){
	var pId = getParent();
	if(pId){
		var pCap = aa.cap.getCap(pId).getOutput(); 
		var parentAppType = pCap.getCapType().toString(); 
		logDebug(parentAppType);
		if(parentAppType == "MCD/Intrastate Motor Carrier/Transfer/NA"){
			editAppSpecific("Transfer Application Number", pId.getCustomID());
			removeParent(pId.getCustomID());
		}
	}
}