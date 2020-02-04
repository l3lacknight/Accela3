/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_SEND_REVOKED_ATE_EMAIL.js  Trigger: Batch
| Client: MSP
|
| CREATED 2/4/2020 by Vincent Austin
| Used to send e-mails to carriers who have Revoked authority status and About to Expire expiration status. 
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
maxSeconds = 300;
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

/********************Test Params*********************************

aa.env.setValue("lookAheadDays",91);
aa.env.setValue("daySpan",0);

aa.env.setValue("expirationStatus","");
aa.env.setValue("newExpirationStatus","");

aa.env.setValue("appStatus", "");
aa.env.setValue("skipAppStatus","");
aa.env.setValue("newApplicationStatus", "");
aa.env.setValue("acaDisplay", "");

aa.env.setValue("fromDate","12/31/2017");
aa.env.setValue("toDate","12/31/2017");

aa.env.setValue("emailAddress","batchscript@yahoo.com");

****************************************************************/
//Looks for the following record types
var appGroup = "MCD";
var appTypeType = "Intrastate Motor Carrier";
var appSubtype = "Certificate of Authority";
var appCategory = "NA";
/////////////////////////////////////////////

var lookAheadDays = aa.env.getValue("lookAheadDays"); // Number of days from today
var daySpan = aa.env.getValue("daySpan"); // Days to search (6 if run weekly, 0 if daily, etc.)

var expStatus = getParam("expirationStatus"); //   test for this expiration status
var newExpStatus = getParam("newExpirationStatus"); //   update to this expiration status

var appStatus = getParam("appStatus");
var skipAppStatusArray = getParam("skipAppStatus").split(","); //   Skip records with one of these application statuses
var newAppStatus = getParam("newApplicationStatus"); //   update the CAP to this status
var acaDisplay = getParam("acaDisplay");

var fromDate = getParam("fromDate"); // Hardcoded dates.   Use for testing only
var toDate = getParam("toDate"); // ""
var dFromDate = aa.date.parseDate(fromDate); //
var dToDate = aa.date.parseDate(toDate); //

var emailAddress = getParam("emailAddress"); //   email address to send log file to

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();

if(!fromDate.length){ // no "from" date, assume today
//	fromDate = dateAdd(null, 0);
	fromDate = dateAdd(null, parseInt(lookAheadDays))
}
if(!toDate.length){ // no "to" date, assume today
//	toDate = fromDate;
	toDate = dateAdd(null, parseInt(lookAheadDays) + parseInt(daySpan))
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
	var capFilterType = 0;
	var capFilterStatus = 0;
	var capCount = 0;
	var expResult = aa.expiration.getLicensesByStatus(expStatus);
	
	if(expResult.getSuccess()){
		theseExp = expResult.getOutput();
		logDebug(br+"Processing " + theseExp.length + " about to expire records");
		for(i in theseExp){
			var sendEmail = false;
			var updateLp = false;
			var thisCap = aa.cap.getCapByPK(theseExp[i].getCapID(),true).getOutput();
			if(thisCap){
				
				var thisCapModel = thisCap.getCapID();
				
				var thisCapType = thisCap.getCapType();
				var thisCapTypeArray = thisCapType.toString().split("/");
				if(matches(appGroup,"*",thisCapTypeArray[0])){
					if(matches(appTypeType,"*",thisCapTypeArray[1])){
						if(matches(appSubtype,"*",thisCapTypeArray[2])){
							if(matches(appCategory,"*",thisCapTypeArray[3])){
								var thisCapStatus = thisCap.getCapStatus();
								
								if(matches(appStatus,thisCapStatus)){
									sendEmail = true;
								}
								if(matches(appStatus,"",null) && !exists(thisCapStatus, skipAppStatusArray)){
									sendEmail = false;
								}
								
								if(sendEmail){
									var thisAltId = thisCap.getAltID();
									logDebug(br+thisAltId+": "+thisCapType);
									logDebug(br+"The following carrier needs to be sent an e-mail"+br);
									capCount++;
									
									/* if(newExpStatus.length > 0 && newAppStatus.length == 0){// update expiration status only
										theseExp[i].setExpStatus(newExpStatus);
										aa.expiration.editB1Expiration(theseExp[i].getB1Expiration());
										logDebug("Expiration status updated to "+newExpStatus);
										capCount++;
									} */
									
									 /* if(newAppStatus.length > 0 && newExpStatus.length == 0){// update CAP status only
										updateAppStatus(newAppStatus, "updated by batch script", thisCapModel);
										updateLp = true;
										capCount++;
									} */
									
									/* if(newExpStatus.length > 0 && newAppStatus.length > 0){// update both CAP status and Expiration status
										theseExp[i].setExpStatus(newExpStatus);
										aa.expiration.editB1Expiration(theseExp[i].getB1Expiration());
										updateAppStatus(newAppStatus, "updated by batch script", thisCapModel);
										logDebug("Expiration status updated to "+newExpStatus);
										updateLp = true;
										
										capCount++;
									} */
									
									/* if(updateLp){
										//get refLp to edit standard fields for ACA display
										var refLPModel = getRefLicenseProf(thisAltId);
										if(!refLPModel){
											logDebug("Ref LP " + refLPNum + " not found");
										}else{
											if(matches(acaDisplay,"Y","Yes")){
												refLPModel.setAcaPermission(null);//the system interprets null as Y (this will display in ACA)
											}else refLPModel.setAcaPermission("N");
											
											refLPModel.setInsuranceCo(newAppStatus);
											aa.licenseScript.editRefLicenseProf(refLPModel);
										}
										
										//update ref LP attributes
										editRefLicProfAttribute(thisAltId,"INTRASTATE AUTHORITY STATUS",newAppStatus);
										editRefLicProfAttribute(thisAltId,"INTRASTATE AUTHORITY STATUS DA",dateAdd(null,0));
										
										//update trans LP attributes
										editLicProfAttribute(thisCapModel,thisAltId,"INTRASTATE AUTHORITY STATUS",newAppStatus);
										editLicProfAttribute(thisCapModel,thisAltId,"INTRASTATE AUTHORITY STATUS DA",dateAdd(null,0));
									} */
									
								}else{ capFilterStatus++; continue; }
							}else{ capFilterType++; continue; }
						}else{ capFilterType++; continue; }
					}else{ capFilterType++; continue; }
				}else{ capFilterType++; continue; }
			}else{
				logDebug("No records returned");
				break;
			}
		}
	}else{
		logDebug("ERROR: Getting Expirations, reason is: " + expResult.getErrorType() + ":" + expResult.getErrorMessage());
		return false
	}

	if(theseExp.length > 0) logDebug("Total licenses qualified by status and date range: " + theseExp.length);
	if(capFilterType > 0) logDebug("Ignored due to application type: " + capFilterType);
	if(capFilterStatus > 0) logDebug("Ignored due to CAP Status: " + capFilterStatus);
	if(capCount > 0) logDebug("Total CAPS processed: " + capCount);
}
