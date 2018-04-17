/*------------------------------------------------------------------------------------------------------/
| Program : ACA ONLOAD TRANSFER EQUIP LIST.js
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
	logDebug("ACA ONLOAD TRANSFER EQUIP LIST");
	var partOfTransfer = AInfo["Application is Part of a Transfer"];
	logDebug(partOfTransfer);
	var operationType = AInfo["Operation Type"];
	logDebug(operationType);
	if (partOfTransfer == "Y" || partOfTransfer == "Yes") {
		parentCapIdString = "" + AInfo["Transfer Application Number"];
		logDebug(parentCapIdString);
		if (parentCapIdString != "" && parentCapIdString != "null") {
			parentCapId = aa.cap.getCapID(parentCapIdString).getOutput();
			if (parentCapId == null) {
				logDebug("Could not get parent cap id");
			}
			else {
				//parentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);
				equipTable = loadASITable("EQUIPMENT LIST", parentCapId);
				logDebug(equipTable);
				if (equipTable && equipTable.length > 0) {
					logDebug("Found " + equipTable.length + " rows");
					eqList = new Array();
					for (var eachRow in equipTable) {
						thisRow = equipTable[eachRow];
						newRow = new Array();
						logDebug(thisRow["Type"].fieldValue);
						if(thisRow["Vehicle Action"] == "Transfer"){
							newRow["Type"] = new asiTableValObj("Type", thisRow["Type"].fieldValue, "Y");
							newRow["Year"] = new asiTableValObj("Year", thisRow["Year"].fieldValue, "Y");
							newRow["Make"] = new asiTableValObj("Make", thisRow["Make"].fieldValue, "Y");
							newRow["Serial#/VIN"] = new asiTableValObj("Serial#/VIN", thisRow["Serial#/VIN"].fieldValue, "Y");
							newRow["GVWR"] = new asiTableValObj("GVWR", thisRow["GVWR"].fieldValue, "N");
							newRow["Unit/Fleet #"] = new asiTableValObj("Unit/Fleet #", thisRow["Unit/Fleet #"].fieldValue, "N");
							newRow["License Plate State"] = new asiTableValObj("License Plate State", thisRow["License Plate State"].fieldValue, "N");
							if (thisRow["License Vehicle Owner"] == null)
								newRow["Leased Vehicle Owner"] = new asiTableValObj("Leased Vehicle Owner", "", "N");
							else
								newRow["Leased Vehicle Owner"] = new asiTableValObj("Leased Vehicle Owner", thisRow["Leased Vehicle Owner"].fieldValue, "N");
							newRow["Vehicle Action"] = new asiTableValObj("Vehicle Action", "Transfer", "Y");
							if (thisRow["Status"] == null)
								newRow["Status"] = new asiTableValObj("Status", "", "N");
							else
								newRow["Status"] = new asiTableValObj("Status", thisRow["Status"].fieldValue, "N");
							if (thisRow["MPSC Decal #"] == null)
								newRow["MPSC Decal #"] = new asiTableValObj("MPSC Decal #", "", "N");
							else
								newRow["MPSC Decal #"] = new asiTableValObj("MPSC Decal #", thisRow["MPSC Decal #"].fieldValue, "N");
							if(operationType == "General Commodities")
								newRow["Equipment Use"] = new asiTableValObj("Equipment Use", thisRow["Equipment Use"].fieldValue, "Y");
							else
								newRow["Equipment Use"] = new asiTableValObj("Equipment Use", thisRow["Equipment Use"].fieldValue, "N");
							newRow["Plate Fee"] = new asiTableValObj("Plate Fee", "0", "N");
							eqList.push(newRow);
						}
					}
					asit = cap.getAppSpecificTableGroupModel();
					if (asit != null) {
						new_asit = addASITable4ACAPageFlowLOCAL(asit, "EQUIPMENT LIST", eqList);
						cap.setAppSpecificTableGroupModel(new_asit);
						aa.env.setValue("CapModel", cap);
					}
					else { logDebug("asit object is null"); }
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


function addASITable4ACAPageFlowLOCAL(destinationTableGroupModel,tableName,tableValueArray) // optional capId
    	{
  	//  tableName is the name of the ASI table
  	//  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
  	// 
  	
    	var itemCap = capId
  	if (arguments.length > 3)
  		itemCap = arguments[3]; // use cap ID specified in args
  
  	var ta = destinationTableGroupModel.getTablesMap().values();
  	var tai = ta.iterator();
  	
  	var found = false;
  	
  	while (tai.hasNext())
  		  {
  		  var tsm = tai.next();  // com.accela.aa.aamain.appspectable.AppSpecificTableModel
  		  if (tsm.getTableName().equals(tableName)) { found = true; break; }
  	          }


  	if (!found) { logDebug("cannot update asit for ACA, no matching table name"); return false; }
  	
	var fld = aa.util.newArrayList();  // had to do this since it was coming up null.
        var fld_readonly = aa.util.newArrayList(); // had to do this since it was coming up null.
  	var i = -1; // row index counter
  
         	for (thisrow in tableValueArray)
  		{
  
 
  		var col = tsm.getColumns()
  		var coli = col.iterator();
  
  		while (coli.hasNext())
  			{
  			var colname = coli.next();
  			
			if (typeof(tableValueArray[thisrow][colname.getColumnName()]) == "object")  // we are passed an asiTablVal Obj
				{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()].fieldValue ? tableValueArray[thisrow][colname.getColumnName()].fieldValue : "",colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField",args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g,"\+"));
				fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
				fld.add(fldToAdd);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);
				
				}
			else // we are passed a string
				{
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()] ? tableValueArray[thisrow][colname.getColumnName()] : "",colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField",args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g,"\+"));
				fldToAdd.setReadOnly(false);
				fld.add(fldToAdd);
				fld_readonly.add("N");

				}
  			}
  
  		i--;
  		
  		tsm.setTableFields(fld);
  		tsm.setReadonlyField(fld_readonly); // set readonly field
  		}
  
  
                tssm = tsm;
                
                return destinationTableGroupModel;
                
  	}