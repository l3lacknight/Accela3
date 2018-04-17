/*------------------------------------------------------------------------------------------------------/
| Program : ACA ONLOAD NAME CHANGE.js
| Event   : ACA_onload Event
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; 					// Set to true to see results in popup window
var showDebug = false; 						// Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; 		// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; 		// Use Group name when populating Task Specific Info Values
var cancel = false;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; 						// Message String
var debug = ""; 							// Debug String
var br = "<BR>"; 						// Break Tag

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
		return emseScript.getScriptText() + "";	
    	} catch (err) {
        	return "";
    	}
}


var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN"; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID(); 				// alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); 			// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); 			// Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();

var AInfo = new Array(); 					// Create array for tokenized variables
loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
try {
	logDebug("ACA ONLOAD NAME CHANGE");
	parentCapIdString = "" + cap.getParentCapID();
	logDebug(parentCapIdString);
	if (parentCapIdString != "" && parentCapIdString != "null") {
		pca = parentCapIdString .split("-") ; 
		parentCapId = aa.cap.getCapID(pca[0],pca[1],pca[2]).getOutput()
		if (parentCapId == null) {
			logDebug("Could not get parent cap id");
		}
		else {
			logDebug("getCapViewBySingle4ACA");
			parentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);
			//lpModel = parentCap.getLicenseProfessionalModel();
			lpList = parentCap.getLicenseProfessionalList();
			if (lpList != null) {
				licProfArr = lpList.toArray();
				logDebug(licProfArr.length);
				if (licProfArr.length > 0) {
					lpModel = licProfArr[0];
					editAppSpecific4ACA("Address Line 1", lpModel.getAddress1());
					editAppSpecific4ACA("Address Line 2",lpModel.getAddress2());
					editAppSpecific4ACA("City", lpModel.getCity());
					editAppSpecific4ACA("State", lpModel.getState());
					editAppSpecific4ACA("ZIP Code", lpModel.getZip());
					editAppSpecific4ACA("Carrier Phone", lpModel.getPhone1());
					editAppSpecific4ACA("Carrier Fax", lpModel.getFax());
					editAppSpecific4ACA("Carrier Email", lpModel.getEmail());

					editAppSpecific4ACA("New Carrier Name", lpModel.getBusinessName());
					editAppSpecific4ACA("New Owner/Parent Corp. Name", lpModel.getBusName2());
				}
			}
		}
	}

}
catch (err) { logDebug("**ERROR : " + err); }


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

