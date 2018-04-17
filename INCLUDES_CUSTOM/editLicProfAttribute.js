function editLicProfAttribute(licCapId, pLicNum,pAttributeName,pNewAttributeValue) {

	var attrfound = false;
	var oldValue = null;
	var licObj = null;

	licObjArr = getLicenseProfessional(licCapId)
	if (licObjArr == null) return;
	for (tlpIndex in licObjArr) {
		thisTranLP = licObjArr[tlpIndex];
		if (thisTranLP.getLicenseNbr() == pLicNum) {
			licObj = thisTranLP;
		}
	}

	if (licObj == null) {
		logDebug("Transactional licensed professional does not exist");
		return;
	}
	attributeType = licObj.getLicenseType();
	casm = licObj.getAttributes();  // ContactAttributeSciptModel
	for (i in casm) {
		thisAttr = casm[i];
		if ("" + thisAttr.getAttributeName() == pAttributeName) {
			oldValue = thisAttr.getAttributeValue();
			thisAttr.setAttributeValue(pNewAttributeValue);
			casm[i] = thisAttr;
			attrfound = true;
		}
	}
	if (attrfound)	{
		licObj.setAttributes(casm);
		editResult = aa.licenseProfessional.editLicensedProfessional(licObj);
		if (editResult.getSuccess()) {
			logDebug("Updated Tran Lic Prof: " + pLicNum + ", attribute: " + pAttributeName + " from: " + oldValue + " to: " + pNewAttributeValue)
		}
		else {
			logDebug("Error updating transaction lic prof " + editResult.getErrorMessage());
		}
	}
}