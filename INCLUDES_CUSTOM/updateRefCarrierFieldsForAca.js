function updateRefCarrierFieldsForAca(licNum){//no param needed when running on ref lp update, licNum param needed when running on non ref lp events
	if(arguments.length < 1){
		licNum = LicenseModel.stateLicense;
	}
	var refLicObj = new licenseProfObject(licNum,"Carrier");
	if(refLicObj){
		var ias = refLicObj.getAttribute("Intrastate Authority Status");
		
		refLicObj.refLicModel.setInsuranceCo(ias);
		
		if(matches(ias,"Active","Revoked","Temporarily Discontinued","Suspended")){
			refLicObj.refLicModel.setAcaPermission(null);
		}else{
			refLicObj.refLicModel.setAcaPermission("N");
		}
		refLicObj.updateRecord();
	}
}