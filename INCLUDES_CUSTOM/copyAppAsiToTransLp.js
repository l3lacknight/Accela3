function copyAppAsiToTransLp(capId){
	//get trans lp, assume only 1
	
	/* ASI to Ref LP object*/
	if(AInfo["Worker's Compensation Exempt"] != null){
		if(AInfo["Worker's Compensation Exempt"] == "Yes" || AInfo["Worker's Compensation Exempt"] == "Y") 
			newLic.setWcExempt("Y");
		else
			newLic.setWcExempt("N");
	}
	if(AInfo["Operation Type"] != null){
		newLic.setLicenseBoard(AInfo["Operation Type"]);
	}
}