/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_UCR_DATA_LOAD.js  Trigger: Batch
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
aa.env.setValue("inputDataFile", "");
aa.env.setValue("delimiter","|");
aa.env.setValue("emailAddress", "batchscript@yahoo.com");

aa.env.setValue("fromDate", null);
aa.env.setValue("toDate", null);
*/

var LIC_PROF_UDAPTE_DATA = getParam("inputDataFile");
var DELIM = getParam("delimiter");
var emailAddress = getParam("emailAddress");

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

function mainProcess() {
	var LP_EXP_DATE = "INTERSTATE UCR EXPIRATION DATE"
	var LP_STATUS = "INTERSTATE UCR STATUS"
	var LP_STATUS_DATE = "INTERSTATE UCR STATUS DATE"
	var paidVal = "A"
	var unpaidVal = "S"
	var currentDate = new Date();
	thisYear = currentDate.getFullYear()
	var endOfYearExp = "12/31/" + thisYear
	manualUpdates = []
	
	//////////// LOAD REF LP LIST ///////////
	var refLP = []	
	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
	var ds = initialContext.lookup("java:/AA");
	var conn = ds.getConnection()
	main: try {
		var SQL = "select bus_lic, LISTAGG(lic_nbr, ',') within group (order by lic_nbr) as licList from rstate_lic where serv_prov_code = ? and bus_lic is not null and lic_type = 'Carrier' group by bus_lic"
		var dbStmt = conn.prepareStatement(SQL);
		try {
			dbStmt.setString(1,aa.getServiceProviderCode())
			dbStmt.executeQuery();
		}
		catch(errr) {
			aa.print("inner:" + errr.message);	break main
		}
		results = dbStmt.getResultSet()
		while (results.next()) {
			refLP.push('"'+results.getString("bus_lic")+'": ['+ results.getString("licList") + ']')
		}
		dbStmt.close();
	}
	catch(err) {
		aa.print(err.message); 
		if (typeof dbStmt != "undefined") dbStmt.close();
	}
	conn.close()
	refLP_JSON = '{'+refLP.join(",")+'}'
	jsonObj = JSON.parse(refLP_JSON)

	////////////////UPDATES FROM FILE/////////////////////
	fileUpdates = getScriptText(LIC_PROF_UDAPTE_DATA).replace(/\r/g,"").split("\n")
	if (fileUpdates.length == 0) logDebug("Error with input file from script: '" + LIC_PROF_UDAPTE_DATA + "', No data found.")
	
	for (u in fileUpdates){
		if (elapsed() > maxSeconds) {
			// only continue if time hasn't expired
			logDebug("====== Timeout Occured ====================================================================")
			logDebug("**Error: Script Timeout has occured. Last line processed: " + (parseInt(u))) ;
			timeExpired = true ;
			break;
		}
		line = fileUpdates[u].split(DELIM)
		if (line.length != 3) {
			manualUpdates.push("Line: "+(parseInt(u)+1)+" **Error: Could not process line " + (parseInt(u)+1) + ": '" +fileUpdates[u] + "', Expecting format: 'IS_PAID"+DELIM+"USDOT_#"+DELIM+"EXPIRATION_DATE'")
			continue
		}
		firstColumn = (""+line[0]).trim().toUpperCase()
		if ( !matches(firstColumn, paidVal, unpaidVal )) {
			manualUpdates.push("Line: "+(parseInt(u)+1)+" **Error: Could not process line " + (parseInt(u)+1) + ": '" +fileUpdates[u] + "', Expecting: line to start with '"+paidVal+"' or '"+unpaidVal+"'")
			continue
		}
		newStatus = (firstColumn == paidVal) ? "Active" : "Suspended"
		busLicNum = (""+line[1]).trim()
		statusExp = (""+line[2]).trim()
		
		licNumList = jsonObj[busLicNum]
		if (typeof licNumList == "undefined") {
			logDebug("**WARNING could not find any Reference Carriers with USDOT# " + busLicNum)
			continue
		}
		for (n in licNumList) {
			licNum = ""+licNumList[n]
			logDebug("Looking for USDOT #: " + busLicNum + ", licNum: "+licNum)

			/*if (!matches(""+refLicProfGetAttribute(licNum,LP_STATUS),"Active", "Temporarily Discontinued","null", "")) {
				manualUpdates.push("Line: "+(parseInt(u)+1)+" **WARNING: Carrier " + licNum + " with USDOT# "+busLicNum+" not 'Active' or 'Temporarily Discontinued'; No updates made. Please update manually if necessary.")
				continue;
			}*/
			//UPDATE REF LP
			editRefLicProfAttribute(licNum,LP_STATUS_DATE,statusExp)
			if (newStatus == "Active") editRefLicProfAttribute(licNum,LP_EXP_DATE,endOfYearExp)
			editRefLicProfAttribute(licNum,LP_STATUS,newStatus)			
			
			altId = licNum
			var capIdObj = aa.cap.getCapID(altId);
			
			if (!capIdObj.getSuccess()) { 
				logDebug("**ERROR: Could not find Certificate of Authority: " + altId)
				continue
			}
			capId = capIdObj.getOutput();
			cap = aa.cap.getCap(capId).getOutput();
			//UPDATE CAP LP
			capLPs = getLicenseProfessional(capId)
			if (capLPs.length <= 0) {
				logDebug("**Error: Could not find Carriers on record "+altId+" Please update manually if necessary.")
				continue
			}
			
			foundCarrier = false
			for (l in capLPs ) {
				if (capLPs[l].getLicenseType() == "Carrier" && capLPs[l].getBusinessLicense() == busLicNum ) {
					foundCarrier = true
					wasLPUpdated = false
					attrList = capLPs[l].getAttributes()
					if (attrList == null || attrList.length == 0 ) {
						logDebug("Setting New Transactional Carrier Attributes.")
						newAttrList = []
						thisAttr1 = aa.licenseProfessional.getContactAttributeScriptModel().getOutput() 
						thisAttr1.setAuditID("ADMIN");
						thisAttr1.setAuditStatus("A")
						thisAttr1.setContactType("Carrier")
						thisAttr1.setAttributeValueReqFlag("N")
						thisAttr1.setCapID(capId)
						thisAttr1.setServiceProviderCode("MSP")
						thisAttr1.setContactNo(altId)
						thisAttr1.setAttributeName(LP_STATUS_DATE) 
						thisAttr1.setAttributeValue(statusExp)
						thisAttr1.setAttributeValueDataType("Date")
						thisAttr1.setDisplayOrder("120")
						newAttrList.push(thisAttr1)
						
						if (newStatus == "Active"){
							thisAttr2 = aa.licenseProfessional.getContactAttributeScriptModel().getOutput() 
							thisAttr2.setAuditID("ADMIN")
							thisAttr2.setAuditStatus("A")
							thisAttr2.setContactType("Carrier")
							thisAttr2.setAttributeValueReqFlag("N")
							thisAttr2.setCapID(capId)
							thisAttr2.setServiceProviderCode("MSP")
							thisAttr2.setContactNo(altId)
							thisAttr2.setAttributeName(LP_EXP_DATE) 
							thisAttr2.setAttributeValue(endOfYearExp)
							thisAttr2.setAttributeValueDataType("Date")
							thisAttr2.setDisplayOrder("130")
							newAttrList.push(thisAttr2)
						}
						
						thisAttr3 = aa.licenseProfessional.getContactAttributeScriptModel().getOutput() 
						thisAttr3.setAuditID("ADMIN")
						thisAttr3.setAuditStatus("A")
						thisAttr3.setContactType("Carrier")
						thisAttr3.setAttributeValueReqFlag("N")
						thisAttr3.setCapID(capId)
						thisAttr3.setServiceProviderCode("MSP")
						thisAttr3.setContactNo(altId)
						thisAttr3.setAttributeName(LP_STATUS) 
						thisAttr3.setAttributeValue(newStatus)
						thisAttr3.setAttributeValueDataType("DropdownList")
						thisAttr3.setDisplayOrder("110")
						newAttrList.push(thisAttr3)
						
						capLPs[l].setAttributes(newAttrList)
						wasLPUpdated = aa.licenseProfessional.editLicensedProfessional(capLPs[l]).getSuccess()
					}
					else {
						count = 0
						logDebug("Updating Existing Transactional Carrier Attributes")
						for(i in attrList) {
							if (attrList[i].getAttributeName() == LP_STATUS_DATE) {
								attrList[i].setAttributeValue(statusExp)
								count++
							}
							else if (attrList[i].getAttributeName() == LP_EXP_DATE) {
								if (newStatus == "Active") attrList[i].setAttributeValue(endOfYearExp)
								count++
							}
							else if (attrList[i].getAttributeName() == LP_STATUS) {
								attrList[i].setAttributeValue(newStatus)
								count++
							}
							if (count == 3 ) break
						}
						capLPs[l].setAttributes(attrList)
						wasLPUpdated = aa.licenseProfessional.editLicensedProfessional(capLPs[l]).getSuccess()
					}
					if (!wasLPUpdated) {
						manualUpdates.push("Line: "+(parseInt(u)+1)+" **ERROR: Could not update Carrier with USDOT # " + busLicNum + " on License " +altId + ". Please manually update '"+LP_STATUS_DATE+"' to '"+statusExp+"'; '"+LP_STATUS+"' to '"+newStatus+"'; '"+LP_EXP_DATE+"' to '"+endOfYearExp+"'")
					}
				}
				if (!foundCarrier) logDebug("**Error: Could not find Carrier with USDOT # " + busLicNum + " on License " +altId)
			}
		}
	}
	if ( manualUpdates.length > 0 ) logDebug("====== LINE ITEM ISSUES WITH INPUT DATA ===================================================")
	for (i in manualUpdates) logDebug(manualUpdates[i])
	if(!timeExpired) logDebug("Please manually remove the contents of the input data in '"+LIC_PROF_UDAPTE_DATA+"' to prevent uninteded updates in the future.")
}