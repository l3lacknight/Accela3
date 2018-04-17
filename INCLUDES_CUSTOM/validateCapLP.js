function validateCapLP()
{
	cancel = true;
	showMessage = true;
	
	
	comment("capId: " +capId);
	
	var lpList = getLicenseProfessional(capId);
	
	//if(lpList)
		comment("lpList: "+lpList);
		
	for ( i in lpList) 
	{
		if(lpList[i] == null) continue;
		comment("i: " +i);
		comment("lpList[i]: " +lpList[i]);
		comment("lpList[i].getLicenseNbr(): " +lpList[i].getLicenseNbr());
	}
}