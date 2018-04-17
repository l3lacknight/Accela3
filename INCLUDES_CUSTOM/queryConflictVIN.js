function queryConflictVIN(){//optional param cvedNum for current carrier
	var returnStruct = { 
		'isIssue': false,
		'issueMessage': new Array()
	};

	if (typeof EQUIPMENTLIST != 'object')
		return returnStruct
	var vinList = new Array()
	var dupList = new Array()
	var MPSCnumber = "";
	
	logDebug("capId: "+capId);
	viewObj(capId);
	
	var lpList = getLicenseProfessional(capId);
	if(lpList)
		logDebug("lpList: "+lpList);
	
	for ( i in lpList) {
		//Only get the 1st LIC # (per Chris)
		MPSCnumber = lpList[i].getLicenseNbr();
		comment("MPSCnumber from lp list: "+MPSCnumber);
		break;
	}
	
	if(MPSCnumber == "" && arguments.length == 1 && !matches(arguments[0],null,"")){
			MPSCnumber = arguments[0];
			comment("MPSCnumber from param: "+MPSCnumber);
	}
	


	thisASIT = EQUIPMENTLIST 
	for (r in thisASIT) {
		// Only check active VINs
		if ( matches(""+thisASIT[r]["Status"], "Active" ))
			vinList.push(thisASIT[r]["Serial#/VIN"])
	}

	if (vinList.length > 0) {
		var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
		var ds = initialContext.lookup("java:/AA");
		var conn = ds.getConnection();
		var sqlList = "?"
		var defaultStatus = "Inactive" //Default blanks to inactive
		for (i in vinList) if (i>0) sqlList += ",?";

		var sqlString = 
		"SELECT DISTINCT B1_ALT_ID||'||'|| ATTRIBUTE_VALUE as return_string, nvl((SELECT ATTRIBUTE_VALUE FROM BAPPSPECTABLE_VALUE V1 \
			WHERE B.B1_PER_ID1 = V1.B1_PER_ID1 AND row_index=v.row_index and column_name = 'Status' \
			AND B.B1_PER_ID2 = V1.B1_PER_ID2 \
			AND B.B1_PER_ID3 = V1.B1_PER_ID3 \
			AND B.SERV_PROV_CODE = 'MSP' \
			AND B.B1_PER_SUB_TYPE = 'Certificate of Authority' \
			AND V1.SERV_PROV_CODE = 'MSP'),?) as return_status \
		FROM B1PERMIT B INNER JOIN BAPPSPECTABLE_VALUE V \
			ON B.B1_PER_ID1 = V.B1_PER_ID1 \
			AND B.B1_PER_ID2 = V.B1_PER_ID2 \
			AND B.B1_PER_ID3 = V.B1_PER_ID3 \
			AND B.SERV_PROV_CODE = 'MSP' \
			AND V.SERV_PROV_CODE = 'MSP' \
		WHERE TABLE_NAME LIKE '%EQUIPMENT_LIST' \
			AND COLUMN_NAME LIKE 'Serial%VIN' \
			AND B1_ALT_ID <> ? \
			AND ATTRIBUTE_VALUE in ($LIST$)";

		sqlString = sqlString.replace("$LIST$", sqlList)
		var uStmt = conn.prepareStatement(sqlString);
		uStmt.setString(1,defaultStatus)
		uStmt.setString(2,capIDString )
		for (n in vinList) uStmt.setString(parseInt(n)+3, vinList[n]);
		uStmt.executeQuery();
		results = uStmt.getResultSet()

		while (results.next()) {
			if(results.getString("return_status") == "Active")
				dupList.push(results.getString("return_string"))
		}
		uStmt.close();
		conn.close();
		//logDebug("DUPs: "+ dupList);
		for ( d in dupList){
			thisDup = (""+dupList[d]).split("||")
			if (thisDup.length < 2) continue;
			thisCap = thisDup[0];
			thisVIN = thisDup[1];
			dupMPSCnumber = "";

			var dupCapId = null;
			var dupCapIdObj = aa.cap.getCapID(thisCap);
			if (dupCapIdObj.getSuccess()) { 
				dupCapId = dupCapIdObj.getOutput();  
				var dupLpList = getLicenseProfessional(dupCapId)
				for ( i in dupLpList) {
					dupMPSCnumber = dupLpList[i].getLicenseNbr()
					break;
				}

				if (MPSCnumber != dupMPSCnumber) {
					returnStruct.isIssue = true
					returnStruct.issueMessage.push("VIN: " + thisVIN + " is currently active on Authority: "+ thisCap )
				}
			}
		}
	}
	return returnStruct
}