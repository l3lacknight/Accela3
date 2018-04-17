function createCertOfAuth() {
	mpscNum = getMPSCNumFromLP();
	if (mpscNum != null) {
		var existResult = aa.cap.getCapID(mpscNum).getSuccess();
		if(!existResult){
		 	newLicId = createParent(appTypeArray[0], appTypeArray[1], "Certificate of Authority", "NA",null);
			if (newLicId) {
				aa.cap.updateCapAltID(newLicId, mpscNum);
				copyLicensedProf(capId, newLicId);
				newLicIdString = newLicId.getCustomID();
				//updateAppStatus("Issued","Originally Issued",newLicId);
				thisLic = new licenseObject(newLicIdString,newLicId);
				thisLic.setStatus("Active");
	
	            var certIssueDate = getStatusDateinTaskHistory("Certification", "Issued");
	            var certIssueMonth = certIssueDate.getMonth() + 1;
	            var certIssueDay = certIssueDate.getDate();
	            var certIssueYear = 1900 + certIssueDate.getYear();
	            if (certIssueDate != null && certIssueMonth > 9){
	                var certFirstExpYear = certIssueYear + 1;
	                thisLic.setExpiration("12/31/"+certFirstExpYear);
	            }
	            else{
	                certFirstExpYear = certIssueYear;
	                thisLic.setExpiration("12/31/"+certFirstExpYear);
	            }
	            logDebug("The Certificate of Authority was issued on " + certIssueDate + " and will expire on 12/31/" + certFirstExpYear + ".");
	
				if (certIssueDate != null){
					var cIDate = certIssueMonth+"/"+certIssueDay+"/"+certIssueYear;
					thisLic.setIssued(cIDate);
					logDebug("RefLP License Issued Date updated to: "+cIDate);
				}
	
				var ignore = lookup("EMSE:ASI Copy Exceptions","License/*/*/*"); 
				var ignoreArr = new Array();
				if(ignore != null) ignoreArr = ignore.split("|");
				copyAppSpecific(newLicId,ignoreArr);
				copyASITables(capId,newLicId);
				linkMPSCtoPU(mpscNum, capId);
				
				//get refLp to edit standard fields for ACA display
				var refLPModel = getRefLicenseProf(mpscNum);
				if(!refLPModel){
					logDebug("Ref LP " + refLPNum + " not found");
				}else{
					refLPModel.setAcaPermission(null);//the system interprets null as Y (this will display in ACA)
					refLPModel.setInsuranceCo("Active");
					aa.licenseScript.editRefLicenseProf(refLPModel);
				}
				
				editRefLicProfAttribute(mpscNum,"INTRASTATE AUTHORITY EXPIRATIO","12/31/"+certFirstExpYear);//sets expiration year on Ref LP
				editRefLicProfAttribute(mpscNum,"INTRASTATE AUTHORITY STATUS","Active");
				editRefLicProfAttribute(mpscNum,"INTRASTATE AUTHORITY STATUS DA",cIDate);
				editRefLicProfAttribute(mpscNum,"INTRASTATE AUTH APP DATE",fileDate);
				editLicProfAttribute(newLicId, mpscNum,"INTRASTATE AUTHORITY EXPIRATIO","12/31/"+certFirstExpYear);//sets expiration year on Cert trans LP
				editLicProfAttribute(newLicId, mpscNum,"INTRASTATE AUTHORITY STATUS","Active");
				editLicProfAttribute(newLicId, mpscNum,"INTRASTATE AUTHORITY STATUS DA",cIDate);
				editLicProfAttribute(newLicId, mpscNum,"INTRASTATE AUTH APP DATE",fileDate);
				
				if (AInfo["Application is Part of a Transfer"] == "Y" || AInfo["Application is Part of a Transfer"] == "Yes") {
					eqListTable = loadASITable("EQUIPMENT_LIST", newLicId);
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
						newRow["Vehicle Action"] = new asiTableValObj("Vehicle Action", ""/*thisRow["Vehicle Action"].fieldValue*/, "N");
						newRow["Status"] = new asiTableValObj("Status", thisRow["Status"].fieldValue, "N");
						newRow["MPSC Decal #"] = new asiTableValObj("MPSC Decal #", thisRow["MPSC Decal #"].fieldValue, "Y");
						var equipUse = thisRow["Equipment Use"].fieldValue;//gets equipment use to set plate fee instead of copying Plate Fee data
						newRow["Equipment Use"] = new asiTableValObj("Equipment Use", equipUse, "N");
						if (equipUse == "Household Goods") pFee = "50.00";
						else pFee = "100.00";
						newRow["Plate Fee"] = new asiTableValObj("Plate Fee", pFee, "N");
						newTable.push(newRow);
					}
					addASITable("EQUIPMENT LIST", newTable);
				}
			}
		}else{
			//Update existing Authority
			logDebug("A Certificate of Authority has already been issued for this CVED number, updating the existing Authority.");
			//get existing Authority capId
			var authCapId = aa.cap.getCapID(mpscNum).getOutput();
			
			//link app to existing Certificate of Authority
			addParent(mpscNum);
			
			//link the RefLP to the public user on the new App
			linkMPSCtoPU(mpscNum, capId);//getting the pu from new app and linking to the updated refLp
			
			//remove existing ASIT, Addresses, Contacts and LPs from Auth
			removeASITable("EQUIPMENT LIST",authCapId);
			removeASITable("CONTINUOUS CONTRACT",authCapId);
			removeCapAddresses(authCapId);
			removeCapContacts(authCapId);
			removeCapLPs(authCapId);
			
			//copy updated ASI, ASIT, Address, Contacts from App to Authority
			var ignore = lookup("EMSE:ASI Copy Exceptions","License/*/*/*"); 
			var ignoreArr = new Array();
			if(ignore != null) ignoreArr = ignore.split("|"); 
			copyAppSpecific(authCapId,ignoreArr);
			copyASITables(capId, authCapId);
			copyAddresses(capId, authCapId);
			copyContacts(capId, authCapId);
			
			//Updates for issuance Record Status
			updateAppStatus("Active","",authCapId);
			//Updates for issuance Expiration Status and date
			thisLic = new licenseObject(mpscNum,authCapId);
			thisLic.setStatus("Active");

            var certIssueDate = getStatusDateinTaskHistory("Certification", "Issued");
            var certIssueMonth = certIssueDate.getMonth() + 1;
            var certIssueDay = certIssueDate.getDate();
            var certIssueYear = 1900 + certIssueDate.getYear();
            if (certIssueDate != null && certIssueMonth > 9){
                var certFirstExpYear = certIssueYear + 1;
                thisLic.setExpiration("12/31/"+certFirstExpYear);
            }
            else{
                certFirstExpYear = certIssueYear;
                thisLic.setExpiration("12/31/"+certFirstExpYear);
            }
            logDebug("The Certificate of Authority was issued on " + certIssueDate + " and will expire on 12/31/" + certFirstExpYear + ".");

			if (certIssueDate != null){
				var cIDate = certIssueMonth+"/"+certIssueDay+"/"+certIssueYear;
				thisLic.setIssued(cIDate);
				logDebug("RefLP License Issued Date updated to: "+cIDate);
			}

			//Update existing reference LP with current info from app
			updateRefLpFromTransLp();
			
			//edit Ref LP for issuance and copy to existing Authority
			editRefLicProfAttribute(mpscNum,"INTRASTATE AUTHORITY EXPIRATIO","12/31/"+certFirstExpYear);//sets expiration year on Ref LP
			editRefLicProfAttribute(mpscNum,"INTRASTATE AUTHORITY STATUS","Active");
			editRefLicProfAttribute(mpscNum,"INTRASTATE AUTHORITY STATUS DA",cIDate);
			editRefLicProfAttribute(mpscNum,"INTRASTATE AUTH APP DATE",fileDate);
			
			var refLPModel = getRefLicenseProf(mpscNum);
			if(!refLPModel){
				logDebug("Ref LP " + refLPNum + " not found");
			}else{
				refLPModel.setAcaPermission(null);//the system interprets null as Y (this will display in ACA)
				refLPModel.setInsuranceCo("Active");
				modifyRefLPAndSubTran(authCapId, refLPModel);
			}
			
			//update results
			logDebug("The existing Authority: "+mpscNum+" was updated and has been reissued");
		}
	}
	logDebug("No CVED# found on Application");
}