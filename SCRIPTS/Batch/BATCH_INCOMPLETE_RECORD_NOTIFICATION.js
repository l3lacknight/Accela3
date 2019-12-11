/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_INCOMPLETE_RECORD_NOTIFICATION.js  Trigger: Batch
| Client: MSP
|
| Version 1.0 - Base Version. 11/01/08 JHS
| Version 2.0 - Updated for Masters Scripts 2.0  02/13/14 JHS
| Version 3.0 - Uses productized Includes files where appropriate and adding test parameters
| Jobs configured: 
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
maxSeconds = 1500;
emailText = "";
message = "";
br = "<br>";
useAppSpecificGroupName = false;
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var SCRIPT_VERSION = 3.0
var useCustomScriptFile = true;  // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if(bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I"){
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if(bzr.getSuccess()){
		SAScript = bzr.getOutput().getDescription();
	}
}

if(SA){
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA,useCustomScriptFile));
	eval(getScriptText(SAScript, SA));
}else{
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useCustomScriptFile));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM",null,useCustomScriptFile));
eval(getScriptText("INCLUDES_BATCH",null,false));

function getScriptText(vScriptName, servProvCode, useProductScripts){
	if(!servProvCode) servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if(useProductScripts){
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		}else{
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	}catch (err){
		return "";
	}
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
showDebug = true;
if(String(aa.env.getValue("showDebug")).length > 0){
	showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
}

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if(batchJobResult.getSuccess()){
	batchJobID = batchJobResult.getOutput();
	logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}else{
	logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

/*----Test Params----//
aa.env.setValue("appGroup", "MCD");
aa.env.setValue("emailAddress", "batchscript@yahoo.com");
aa.env.setValue("lookAheadDays", "-1");
aa.env.setValue("daySpan", "1");
aa.env.setValue("skipAppStatus","Active");
aa.env.setValue("appStatus", "Active");

aa.env.setValue("fromDate", null);
aa.env.setValue("toDate", null);
*/

var appGroup = getParam("appGroup");
var appTypeType = getParam("appTypeType");			
var appSubtype = getParam("appSubType");
var appCategory = getParam("appCategory");
var emailAddress = getParam("emailAddress");		
var asiField = getParam("asiField");
var asiFieldGroup = getParam("asiGroup")
var skipAppStatusArray = getParam("skipAppStatus").split(",");
var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var appStatus = getParam("appStatus");

var fromDate = getParam("fromDate"); // Hardcoded dates.   Use for testing only
var toDate = getParam("toDate"); // ""

var dFromDate = aa.date.parseDate(fromDate); //
var dToDate = aa.date.parseDate(toDate); //

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();

if(!fromDate.length){ // no "from" date, assume today
	fromDate = dateAdd(null, 0);//fromDate = dateAdd(null, parseInt(lookAheadDays))
}
if(!toDate.length){ // no "to" date, assume today
	toDate = fromDate;
	//toDate = dateAdd(null, parseInt(lookAheadDays) + parseInt(daySpan))
}
var mailFrom = lookup("ACA_EMAIL_TO_AND_FROM_SETTING", "RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

logDebug("Date Range -- fromDate: " + fromDate + ", toDate: " + toDate)

var startTime = startDate.getTime(); // Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

appGroup = appGroup == "" ? "*" : appGroup;
appTypeType = appTypeType == "" ? "*" : appTypeType;
appSubtype = appSubtype == "" ? "*" : appSubtype;
appCategory = appCategory == "" ? "*" : appCategory;
var appType = appGroup + "/" + appTypeType + "/" + appSubtype + "/" + appCategory;

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

try{
	mainProcess();
}catch (err){
	logDebug("ERROR: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if(emailAddress.length)
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess(){
//------------variables--------------//
	
	var startDate = new Date();
	var startTime = startDate.getTime();
	var maxSeconds = 1500;
	
	var incCapArr = [];
	var incCapCount = 0;
	var activeRecs = 0;

	//------------variables--------------//
	
	
	///*
	
	
	
	var capListSR = aa.cap.getCapIDList();
	if(capListSR.getSuccess()){
		var capList = capListSR.getOutput();
		var capListLength = capList.length;
		logDebug("capListLength: "+capListLength);
		if(capListLength > 0){
			for(i=0; i<capListLength; i++){
				var rTime = elapsed();
				if (rTime > maxSeconds) { // only continue if time hasn't expired
					logDebug("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + rTime + " seconds elapsed, " + maxSeconds + " allowed.") ;
					timeExpired = true;
					break;
				}
				
				var thisCap = capList[i]; //*Class = CapIDScriptModel*/ viewObj("thisCap", thisCap);
				
				var capId = aa.cap.getCapID(thisCap.getID1(), thisCap.getID2(), thisCap.getID3()).getOutput(); //*Class = CapIDModel*/ viewObj("capId", capId);
				
				var capModel = aa.cap.getCapByPK(thisCap.getCapID(),true).getOutput(); //*Class = CapModel*/ viewObj("capModel", capModel);
				
//				var capScriptModel = aa.cap.getCap(capId).getOutput(); /*Class = CapScriptModel*/ viewObj("capScriptModel", capScriptModel);
				
//				break;
				
				if(capModel){
					activeRecs++;
//					if(incCapCount > 100)break;
//					if(capModel.getAuditStatus() != "A")continue;
					if(capModel.isCompleteCap())continue;
					if(!matches(capModel.getCapClass(),"INCOMPLETE CAP","INCOMPLETE EST"))continue;
//					if(!capModel.getCreatedByACA())continue;
					logDebug(br+"altId|"+capModel.getAltID()+"|File Date|"+capModel.getFileDate()+"|Cap Class|"+capModel.getCapClass()+"|Audit Status|"+capModel.getAuditStatus()+"|Complete|"+capModel.isCompleteCap());
					
					//get email address
					
					//send notification
					
					incCapCount++;
				}
			}
			
			logDebug("RunTime: "+rTime+", Checked: "+i+" of "+capListLength+" records, found "+incCapCount+" Incomplete of "+activeRecs+" Active records");
			
		}else{
			logDebug("ERROR no caps in list");
		}
	}else{
		logDebug("ERROR no capListSR");
	}
}