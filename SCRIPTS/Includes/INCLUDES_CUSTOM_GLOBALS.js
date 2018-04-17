
LICENSESTATE = "MI";

/****************Debug and Log Controls**********************/
//showDebug = false or 0 - no popups, no writing to bizserver log unless changed within script code itself in branches.
//showDebug = true or 1 - pop-ups only
//showDebug = 2 - log only
//showDebug = 3 - pop-up and logging
//caution, logging levels cause that log to get BIG and scripting to run SLOW.

if(matches(currentUserID, "ADMIN", "CGODWIN", "AUSTINV","HOWER")){//user names MUST be in ALL CAPS!
	showDebug = 3; 
}else{
	showDebug = false;
}

/*************Scripted Email Management Settings*************/
//update/verify this after every restore.  Used to control script-fired email behavior.
//appropriate values are "SUPP","TEST","PROD","DEV","STAGE","CONFIG", etc...
//ensure that sendNotificationWithEnvControl() function is updated accordingly
environmentName = "SUPP";
agencyEmailFrom = "MSP-CVED-MCS-Credentialing@michigan.gov"
agencyReplyEmail = "no-reply@michigan.gov"
//suppEmailTarget = "";//this should be a distribution group
//testEmailTarget = "";//this should be a distribution group for testers to check proper routing of scripted emails from the system
acaURL = "https://acasupp3.accela.com/MSP";  //update/verify at restore

//Adding additional code from INCLUDES_GLOBALS file (non-productized)
// get first address for emails
capAddress = "";
var capAddressResult1 = aa.address.getAddressByCapId(capId);
if(capAddressResult1.getSuccess()){
	var Address = capAddressResult1.getOutput();
	for(yy in Address){
		
		capAddress = Address[yy].getHouseNumberStart();
		
		if(Address[yy].getStreetDirection())
			capAddress += " " + Address[yy].getStreetDirection();
		
		capAddress += " " + Address[yy].getStreetName();
		
		if(Address[yy].getStreetSuffix())
			capAddress += " " + Address[yy].getStreetSuffix();
		
		if(Address[yy].getUnitStart())
			capAddress += " " + Address[yy].getUnitStart();
		
		capAddress += ", " + Address[yy].getCity();
		capAddress += " " + Address[yy].getZip();
	}
}