function editParentExpiration(eStatus,eDate){
	var savedCapId = capId;
	var pId = getParent();
	if(pId){
		capId = pId;
		licEditExpInfo(eStatus,eDate);
		capId = savedCapId;
		return true;
	}else{
		logDebug("No parent found, expiration info not updated");
		return false;
	}
}