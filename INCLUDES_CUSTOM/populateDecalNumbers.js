function populateDecalNumbers() {
	eqListTable = loadASITable("EQUIPMENT LIST");
	newTable = new Array();
	for (var eachRow in eqListTable) {
		thisRow = eqListTable[eachRow];
		newRow = new Array();
		newRow["Type"] = new asiTableValObj("Type", thisRow["Type"].fieldValue, "N");
		newRow["Year"] = new asiTableValObj("Year", thisRow["Year"].fieldValue, "N");
		newRow["Make"] = new asiTableValObj("Make", thisRow["Make"].fieldValue, "N");
		newRow["Serial#/VIN"] = new asiTableValObj("Serial#/VIN", thisRow["Serial#/VIN"].fieldValue, "N");
		newRow["GVWR"] = new asiTableValObj("GVWR", thisRow["GVWR"].fieldValue, "N");
		newRow["Unit/Fleet #"] = new asiTableValObj("Unit/Fleet #", thisRow["Unit/Fleet #"].fieldValue, "N");
		newRow["License Plate State"] = new asiTableValObj("License Plate State", thisRow["License Plate State"].fieldValue, "N");
		newRow["Leased Vehicle Owner"] = new asiTableValObj("Leased Vehicle Owner", thisRow["Leased Vehicle Owner"].fieldValue, "N");
		newRow["Vehicle Action"] = new asiTableValObj("Vehicle Action", thisRow["Vehicle Action"].fieldValue, "N");
		newRow["Status"] = new asiTableValObj("Status", thisRow["Status"].fieldValue, "N");
		vAction = "" + thisRow["Vehicle Action"];
		var vStatus = "" + thisRow["Status"];
		if (matches(vAction, "Add Vehicle", "Replacement Decal", "Renew") && vStatus == "Active") {
			sessID = getSessionID();
			nextNumber = getNextMaskedSeq(sessID, "MPSC Decal Mask", "MPSC Decal Sequence", "Agency");
			newRow["MPSC Decal #"] = new asiTableValObj("MPSC Decal #", "" + nextNumber, "Y");
		}
		else {
			newRow["MPSC Decal #"] = new asiTableValObj("MPSC Decal #", thisRow["MPSC Decal #"].fieldValue, "Y");
		}
		newRow["Equipment Use"] = new asiTableValObj("Equipment Use", thisRow["Equipment Use"].fieldValue, "N");
		newRow["Plate Fee"] = new asiTableValObj("Plate Fee", thisRow["Plate Fee"].fieldValue, "N");
		newTable.push(newRow);
	}
	removeASITable("EQUIPMENT LIST");
	addASITable("EQUIPMENT LIST", newTable);
}