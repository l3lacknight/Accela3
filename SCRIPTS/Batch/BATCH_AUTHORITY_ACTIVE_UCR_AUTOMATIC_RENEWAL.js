/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_AUTHORITY_ACTIVE_UCR_AUTOMATIC_RENEWAL.js  Trigger: Batch
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
maxSeconds = 30000;
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
aa.env.setValue("lookAheadDays",45);
aa.env.setValue("daySpan",0);
aa.env.setValue("expirationStatus","Active");
aa.env.setValue("newExpirationStatus","Active");
aa.env.setValue("appStatus", "");
aa.env.setValue("skipAppStatus","Expired,Permanently Discontinued,Revoked,Suspended");
aa.env.setValue("newApplicationStatus", "");
aa.env.setValue("fromDate","12/31/2017");
aa.env.setValue("toDate","12/31/2017");
aa.env.setValue("cStart", 1000);
aa.env.setValue("cLimit", 2000);
aa.env.setValue("emailAddress","batchscript@yahoo.com");
*/

var appGroup = "MCD";
var appTypeType = "Intrastate Motor Carrier";
var appSubtype = "Certificate of Authority";
var appCategory = "NA";
var lookAheadDays = aa.env.getValue("lookAheadDays"); // Number of days from today
var daySpan = aa.env.getValue("daySpan"); // Days to search (6 if run weekly, 0 if daily, etc.)
var expStatus = "About to Expire"; //   test for this expiration status
var newExpStatus = "Active"; //   update to this expiration status
var appStatus = getParam("appStatus");
var skipAppStatusArray = getParam("skipAppStatus").split(","); //   Skip records with one of these application statuses
var newAppStatus = getParam("newApplicationStatus"); //   update the CAP to this status
var fromDate = getParam("fromDate"); // Hardcoded dates.   Use for testing only
var toDate = getParam("toDate"); // ""
var dFromDate = aa.date.parseDate(fromDate); //
var dToDate = aa.date.parseDate(toDate); //
var emailAddress = getParam("emailAddress"); //   email address to send log file to
var cStart = getParam("cStart");
var cLimit = getParam("cLimit");
var ucrExpDateValidation = []; //array for updated CVED#'s that need to be validated.

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
	var capFilterType = 0;
	var capFilterStatus = 0;
	var capCount = 0;
	var capLimit = 0;
	var today = new Date();
	var thisYear = today.getFullYear();
	
	var expResult = aa.expiration.getLicensesByDate(expStatus, fromDate, toDate);
	
	if(expResult.getSuccess()){
		theseExp = expResult.getOutput();
		logDebug("Processing " + theseExp.length + " expiration records");
		for(i in theseExp){
			var updateRec = false;
			var updateRefLp = false;
			var thisCap = aa.cap.getCapByPK(theseExp[i].getCapID(),true).getOutput();
			if(thisCap){
				capLimit++;
//				if(capLimit < cStart)continue;
//				if(capLimit > cLimit)break;
				var thisCapModel = thisCap.getCapID();
				capId = thisCapModel;
				
				var thisCapType = thisCap.getCapType();
				var thisCapTypeArray = thisCapType.toString().split("/");
				if(matches(appGroup,"*",thisCapTypeArray[0])){
					if(matches(appTypeType,"*",thisCapTypeArray[1])){
						if(matches(appSubtype,"*",thisCapTypeArray[2])){
							if(matches(appCategory,"*",thisCapTypeArray[3])){
								var thisCapStatus = thisCap.getCapStatus();
								
								if(matches(appStatus,thisCapStatus)){
									updateRec = true;
								}
								if(matches(appStatus,"",null) && !exists(thisCapStatus, skipAppStatusArray)){
									updateRec = true;
								}
								
								if(updateRec){
									var thisAltId = thisCap.getAltID();
									
									//Check ASI field Operation Type
									asiObj = aa.appSpecificInfo.getAppSpecificInfos(capId, "MOTOR CARRIER OPERATIONS", "Operation Type");
									oppType = asiObj.getSuccess() && asiObj.getOutput().length > 0 ? ""+(asiObj.getOutput())[0].getChecklistComment() : "";

									//Check LP Template field INTERSTATE UCR STATUS
									capLicenseResult = aa.licenseScript.getLicenseProf(capId);
									capLicenseArr = new Array();
									if (capLicenseResult.getSuccess()){
										capLicenseArr = capLicenseResult.getOutput();
									}
									if (capLicenseArr.length < 1){
										logDebug("WARNING: no license professional available on the application: " + thisAltId);
									}
									
									//get trans lp attributes
									attrList = capLicenseArr[0].getAttributes();
									//get UCR Status
									var gotUCRStatus = false;
									var gotUCRExpDate = false;
									var gotAutoTransport = false;
									var ucrExpYear = null;
									for(i in attrList){
										thisAttr = attrList[i];
										if(!gotUCRStatus && matches(""+thisAttr.getAttributeName(),"INTERSTATE UCR STATUS")){
											statusUCR = ""+thisAttr.getAttributeValue();
											gotUCRStatus = true;
										}
										if(!gotUCRExpDate && matches(""+thisAttr.getAttributeName(),"INTERSTATE UCR EXPIRATION DATE")){
											var ucrExpDate = ""+thisAttr.getAttributeValue();
											gotUCRExpDate = true;
											ucrExpYear = ucrExpDate == "null" ? "null" : new Date(ucrExpDate).getFullYear();
										}
										
										//AM-138 Start
										if(!gotAutoTransport && matches(""+thisAttr.getAttributeName(),"AUTO TRANSPORT")){
											autoTransport = ""+thisAttr.getAttributeValue();
											autoTransport = autoTransport.toUpperCase();
											gotAutoTransport = true;
										//AM-138 End
										}	
										if(gotUCRStatus && gotUCRExpDate && gotAutoTransport){
											logDebug(br+"Found "+oppType+" carrier, CVED#: "+thisAltId+" With UCR Status: "+statusUCR+" and UCR Expiration Year: "+ucrExpYear+ "Auto Transport=" + autoTransport);

											//AM-138 Start
											if(autoTransport == 'YES' || autoTransport == 'Y'){
												logDebug(br+"CVED#: "+thisAltId+" has Auto Transport" +br)
											}					
											//AM-138 End
											break;
										}
									}
									
									//UCR auto renewal //
									if(oppType == "General Commodities" && statusUCR == "Active" && autoTransport != 'YES' && autoTransport != 'Y'){
										//update Certificate of Authority Renewal Info tab
										licEditExpInfo("Active","12/31/"+(thisYear+1));
										capCount++;
										
										//update Certificate of Authority trans LP Intrastate Expiration status and date
										editLicProfAttribute(capId,thisAltId,"INTRASTATE AUTHORITY EXPIRATIO","12/31/"+(thisYear+1));
										editLicProfAttribute(capId,thisAltId,"INTRASTATE AUTHORITY STATUS","Active");
										
										//update ref LP Intrastate Expiration status and date
										editRefLicProfAttribute(thisAltId,"INTRASTATE AUTHORITY EXPIRATIO","12/31/"+(thisYear+1));
										editRefLicProfAttribute(thisAltId,"INTRASTATE AUTHORITY STATUS","Active");
										
										if(ucrExpYear != "null" && ucrExpYear < thisYear){
											//add CVED num to validation list
											ucrExpDateValidation.push(thisAltId);
											
										}
									}
									
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
	if(ucrExpDateValidation.length > 0){
		logDebug("These Carriers were Automatically renewed but do not have a "+thisYear+" UCR Expiration Date:");
		for(i in ucrExpDateValidation){
			logDebug("CVED#: "+ucrExpDateValidation[i]);
		}
	}
}