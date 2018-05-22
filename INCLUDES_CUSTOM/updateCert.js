function updateCert(updateType){
	pId = getParent(); 
	existingCarrierNum = pId.getCustomID();
	var cLic = getRefLicenseProf(existingCarrierNum);
	
	if (!cLic) {
		logDebug("Existing carrier " + existingCarrierNum + " not found"); 
		return;
	}
	logDebug("Modifying existing carrier " + existingCarrierNum);
	
	switch ("" + updateType) {
		case "NAMECHANGE":
			newCarrierName = AInfo["New Carrier Name"];
			newCorpName = AInfo["New Owner/Parent Corp. Name"];
			newBusinessType = AInfo["New Business Type"];
			// update existing ref lp with all data from tran LP except MPSC#
			
			/* LP Template to LP Template */
			if (newBusinessType && newBusinessType != "") {
				editRefLicProfAttribute(existingCarrierNum,"OWNERSHIP TYPE", newBusinessType);
				cLic = getRefLicenseProf(existingCarrierNum);
			}
			cLic.setBusinessName(newCarrierName);
			cLic.setBusinessName2(newCorpName);
			break;
		case "ADDRESSCHANGE":
			addrLine1 = AInfo["Address Line 1"];
			addrLine2 = AInfo["Address Line 2"];
			city = AInfo["City"];
			st = AInfo["State"];
			zip = AInfo["ZIP Code"];
			cPhone = AInfo["Carrier Phone"];
			cFax = AInfo["Carrier Fax"];
			cEmail = AInfo["Carrier Email"];
			
			/*if (addrLine1 && addrLine1 != "")*/ cLic.setAddress1(addrLine1);
			/*if (addrLine2 && addrLine2 != "")*/ cLic.setAddress2(addrLine2); //address line 2 can be removed from the Certificate of Authority and Ref LP
			/*if (city && city!= "")*/ cLic.setCity(city);
			/*if (st && st!="")*/ cLic.setState(st);
			/*if (zip && zip != "")*/ cLic.setZip(zip);
			/*if (cPhone && cPhone != "")*/ cLic.setPhone1(cPhone);
			/*if (cFax && cFax != "")*/ cLic.setFax(cFax); //Fax number can be removed from the Certificate of Authority and Ref LP
			/*if (cEmail && cEmail != "")*/ cLic.setEMailAddress(cEmail);
			removeCapAddresses(pId);
			copyAddresses(capId, pId);
			break;
		case "DISCONTINUANCE":
			opType = AInfo["Operation Type"];
			autoTrans = AInfo["Auto Transport"];
			hazMat = AInfo["Hazardous Material"];
			hga = AInfo["Household Goods Authority"];
			psu = AInfo["Portable Storage Units"];
			cc = AInfo["Continuous Contract"];

			editAppSpecific("Operation Type", opType, pId);
			cLic = getRefLicenseProf(existingCarrierNum);

			editAppSpecific("Auto Transport", autoTrans, pId);
			editRefLicProfAttribute(existingCarrierNum,"AUTO TRANSPORT",autoTrans)

			editAppSpecific("Hazardous Material", hazMat, pId); 
			editRefLicProfAttribute(existingCarrierNum,"HAZ MAT CARRIER", hazMat)

			editAppSpecific("Household Goods Authority", hga, pId);
			editRefLicProfAttribute(existingCarrierNum,"HOUSEHOLD GOODS AUTHORITY", hga);

			editAppSpecific("Portable Storage Units", psu, pId);
			editRefLicProfAttribute(existingCarrierNum,"PORTABLE STORAGE UNITS",psu);

			editAppSpecific("Continuous Contract", cc, pId);
			editRefLicProfAttribute(existingCarrierNum,"CONTINUOUS CONTRACT", cc);
			
			cLic = getRefLicenseProf(existingCarrierNum);
			
			cLic.setLicenseBoard(opType);
			
			break;
		case "TEMPDISCON":
			opType = AInfo["Operation Type"];
			autoTrans = AInfo["Auto Transport"];
			hazMat = AInfo["Hazardous Material"];
			hga = AInfo["Household Goods Authority"];
			psu = AInfo["Portable Storage Units"];
			cc = AInfo["Continuous Contract"];
			effDate = AInfo["Desired Effective Date"];

			editAppSpecific("Operation Type", opType, pId);
			cLic = getRefLicenseProf(existingCarrierNum);

			editAppSpecific("Auto Transport", autoTrans, pId);
			editRefLicProfAttribute(existingCarrierNum,"AUTO TRANSPORT",autoTrans);

			editAppSpecific("Hazardous Material", hazMat, pId); 
			editRefLicProfAttribute(existingCarrierNum,"HAZ MAT CARRIER", hazMat);

			editAppSpecific("Household Goods Authority", hga, pId);
			editRefLicProfAttribute(existingCarrierNum,"HOUSEHOLD GOODS AUTHORITY", hga);

			editAppSpecific("Portable Storage Units", psu, pId);
			editRefLicProfAttribute(existingCarrierNum,"PORTABLE STORAGE UNITS",psu);

			editAppSpecific("Continuous Contract", cc, pId);
			editRefLicProfAttribute(existingCarrierNum,"CONTINUOUS CONTRACT", cc);

			updateAppStatus("Temporarily Discontinued", "", pId);
			
			editRefLicProfAttribute(existingCarrierNum, "INTRASTATE AUTHORITY STATUS", "Temporarily Discontinued");
			editRefLicProfAttribute(existingCarrierNum, "INTRASTATE AUTHORITY STATUS DA", dateAdd(effDate, 0));
			
			cLic = getRefLicenseProf(existingCarrierNum);
			
			//get refLp to edit standard fields for ACA display
			cLic.setAcaPermission(null);//the system interprets null as Y (this will display in ACA)
			cLic.setInsuranceCo("Temporarily Discontinued");
			
			cLic.setLicenseBoard(opType);
			
			break;
		case "PERMDISCON":
			effDate = AInfo["Desired Effective Date"];
			updateAppStatus("Permanently Discontinued", "", pId);
			
			editRefLicProfAttribute(existingCarrierNum, "INTRASTATE AUTHORITY STATUS", "Permanently Discontinued");
			editRefLicProfAttribute(existingCarrierNum, "INTRASTATE AUTHORITY STATUS DA", dateAdd(effDate, 0));
			
			cLic = getRefLicenseProf(existingCarrierNum);
			
			//get refLp to edit standard fields for ACA display
			cLic.setAcaPermission("N");//the system interprets null as Y (this will display in ACA)
			cLic.setInsuranceCo("Permanently Discontinued");
			
			break;
		case "REINSTATE":
			effDate = AInfo["Reinstate Service Effective Date"];
			updateAppStatus("Active", "", pId);
			
			editRefLicProfAttribute(existingCarrierNum, "INTRASTATE AUTHORITY STATUS", "Active");
			editRefLicProfAttribute(existingCarrierNum, "INTRASTATE AUTHORITY STATUS DA", dateAdd(effDate, 0));
			
			cLic = getRefLicenseProf(existingCarrierNum);
			
			//get refLp to edit standard fields for ACA display
			cLic.setAcaPermission(null);//the system interprets null as Y (this will display in ACA)
			cLic.setInsuranceCo("Active");
			
			break;
		case "EQUIPLIST":
			removeASITable("EQUIPMENT LIST", pId);
			copyASITables(capId, pId);
			break;
		case "STAFFUPDATE":
			//attr updates
			if(AInfo["Update Authority Status"] == "CHECKED"){
				var aStatus = AInfo["New Authority Status"];
				updateAppStatus(aStatus, "", pId);
				
				editRefLicProfAttribute(existingCarrierNum, "INTRASTATE AUTHORITY STATUS", aStatus);
				editRefLicProfAttribute(existingCarrierNum, "INTRASTATE AUTHORITY STATUS DA", dateAdd(null, 0));

				//get refLp after attr updates
				cLic = getRefLicenseProf(existingCarrierNum);
			}

			if(AInfo["Update Expiration"] == "CHECKED"){
				var eStatus = AInfo["New Expiration Status"];
				var eDate = "12/31/"+AInfo["New Expiration Year"];
				editParentExpiration(eStatus,eDate);
				editRefLicProfAttribute(existingCarrierNum, "INTRASTATE AUTHORITY EXPIRATIO", dateAdd(eDate, 0));
				
				//get refLp after attr updates
				cLic = getRefLicenseProf(existingCarrierNum);
			}
			
			//std updates
			if(AInfo["Update Authority Status"] == "CHECKED"){
				var aStatus = AInfo["New Authority Status"];
				
				//edit standard refLp fields for ACA display
				cLic.setAcaPermission(null);//the system interprets null as Y (this will display in ACA)
				cLic.setInsuranceCo(aStatus);
			}
			
			//close update amendment
			updateAppStatus("Closed");
			
			break;
		case "INTERUPDATE":
			
			if(AInfo["Update FMC Status"] == "CHECKED"){
				editRefLicProfAttribute(existingCarrierNum, "FEDERAL MOTOR CARRIER STATUS", AInfo["New FMC Status"]);
				editRefLicProfAttribute(existingCarrierNum, "FED MOTOR CARRIER STATUS DATE", dateAdd(AInfo["FMC Effective Date"], 0));
				//get refLp after attr updates
				cLic = getRefLicenseProf(existingCarrierNum);
				logDebug("Update FMC Status Checked ");
			}
			
			if(AInfo["Update UCR Status"] == "CHECKED"){
				editRefLicProfAttribute(existingCarrierNum, "INTERSTATE UCR STATUS", AInfo["New UCR Status"]);
				editRefLicProfAttribute(existingCarrierNum, "INTERSTATE UCR EXPIRATION DATE", AInfo["UCR Expiration Date"]);
				editRefLicProfAttribute(existingCarrierNum, "INTERSTATE UCR STATUS DATE", AInfo["UCR Effective Date"]);
				
				//get refLp after attr updates
				cLic = getRefLicenseProf(existingCarrierNum);
				logDebug("Update UCR Status Checked ");
			}
			
			if(AInfo["Update FMC Number"] == "CHECKED"){
				cLic.setAddress3(AInfo["New FMC Number"]);
				logDebug("Update FMC NUMBER Checked ");
			}
			
			//close amendment
			updateAppStatus("Closed");
			
			break;
		default: break;
	}
	modifyRefLPAndSubTran(pId, cLic);
}