/*------------------------------------------------------------------------------------------------------/
| Program: REF_LP_DATE_AND_STATUS_UPDATE.js  
| Trigger: Batch
| Client: MSP
| Frequency: ADHOC
| Desc: One time ref lp status and date update for ACA
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
maxSeconds = 300;
emailText = "";
message = "";
br = "<br>";
useAppSpecificGroupName = false;
currentUserID = "ADMIN";
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
aa.env.setValue("fromDate", null);
aa.env.setValue("toDate", null);
aa.env.setValue("emailAddress", "batchscript@yahoo.com");
*/

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

function mainProcess() {
	//------------------------------------START APPLICATION FOR AUTHORITY UPDATES----------------------------------------------
	var msg = "";
	var count = 0;
	
	//get application for authority list
	var capResult = aa.cap.getByAppType("MCD", "Intrastate Motor Carrier", "Application", "NA");
	if (capResult.getSuccess()) {
		var myCaps = capResult.getOutput();
		logDebug("Processing " + myCaps.length + " records");
	} else {
		logDebug("ERROR: Getting records, reason is: " + capResult.getErrorType() + ":" + capResult.getErrorMessage());
	}
	
	//filter application for authority list by cap status
	for (index in myCaps){
		logDebug(msg);
		msg = "";
//		if(count>0)break;//testing
		var cap = myCaps[index];
		var capId = cap.getCapID();
		var appId = capId.getCustomID();
		var capStatus = cap.getCapStatus();
		msg += "App: "+appId+", AppStatus: "+capStatus+", ";
		if(capStatus == "Approved")continue;
		//get trans lp
		var capLpList = aa.licenseProfessional.getLicensedProfessionalsByCapID(capId).getOutput();
		if(capLpList == null)continue;
		for(x in capLpList){
			//get lp license number
			var cvedNum = capLpList[x].getLicenseNbr();
		}
		if(matches(cvedNum,null,""))continue;
		if(doesRecordExist(cvedNum))continue;
		//get ref lp with trans lp lic number
		msg += "CVED#: "+cvedNum+", ";
		var refLPModel = getRefLicenseProf(cvedNum);
		if(refLPModel){
			count++;
			//clears fields previously being used to track insurance expiration for ACA
			refLPModel.setBusinessLicExpDate(null);//cargo insurance
			refLPModel.setInsuranceExpDate(null);//plpd insurance
			//clears Authority status for ACA
			refLPModel.setInsuranceCo(null);
			//makes carrier not display in ACA
			refLPModel.setAcaPermission("N");
			//commit ref lp changes
			aa.licenseScript.editRefLicenseProf(refLPModel);

			//update Attr Intrastate Authority Status
			editRefLicProfAttribute(cvedNum, "INTRASTATE AUTHORITY STATUS", null);
			//update trans LP Attr Intrastate Authority Status
			editLicProfAttribute(capId, cvedNum,"INTRASTATE AUTHORITY STATUS", null);
			
			msg += "Cleared Ref LP."
		}
	}
	logDebug("Processed "+count+" CVED #'s without Certificate of Authority.");

	//------------------------------------START CERTIFICATE OF AUTHORITY UPDATES----------------------------------------------
	var msg = "";
	var count = 0;
	
	var capResult = aa.cap.getByAppType("MCD", "Intrastate Motor Carrier", "Certificate of Authority", "NA");
	if (capResult.getSuccess()) {
		var myCaps = capResult.getOutput();
		logDebug("Processing " + myCaps.length + " records");
	} else {
		logDebug("ERROR: Getting records, reason is: " + capResult.getErrorType() + ":" + capResult.getErrorMessage());
	}
	for (index in myCaps){

//		if(count>0)break;//testing
		
		var msg = "";
		var cap = myCaps[index];
		var capId = cap.getCapID();
		var cvedNum = capId.getCustomID();

//		if(cvedNum != "37078")continue;//testing
		
		msg += "CVED#: "+cvedNum+", ";
		var refLicObj = new licenseProfObject(cvedNum,"Carrier");
		if(refLicObj){
			var ias = refLicObj.getAttribute("Intrastate Authority Status");
//			if(ias != "Temporary Discontinued Authority")continue;//testing
			count++;
			msg += "ias: "+ias;
			refLicObj.refLicModel.setBusinessLicExpDate(null);
			refLicObj.refLicModel.setInsuranceExpDate(null);
			refLicObj.refLicModel.setInsuranceCo(ias);
			if(matches(ias,"Temporary Discontinued Authority")){
				refLicObj.setAttribute("Intrastate Authority Status", "Temporarily Discontinued");
				refLicObj.refLicModel.setInsuranceCo("Temporarily Discontinued");
				refLicObj.refLicModel.setAcaPermission(null);
				editLicProfAttribute(capId, cvedNum,"INTRASTATE AUTHORITY STATUS", "Temporarily Discontinued");
			}else if(matches(ias,"Active","Revoked","Temporarily Discontinued","Suspended")){
				refLicObj.refLicModel.setAcaPermission(null);
				editLicProfAttribute(capId, cvedNum,"INTRASTATE AUTHORITY STATUS", ias);
			}else{
				refLicObj.refLicModel.setAcaPermission("N");
				editLicProfAttribute(capId, cvedNum,"INTRASTATE AUTHORITY STATUS", ias);
			}
			refLicObj.updateRecord();
		}
		logDebug(msg);
	}
	logDebug("Processed "+count+" CVED #'s with Certificate of Authority");
}