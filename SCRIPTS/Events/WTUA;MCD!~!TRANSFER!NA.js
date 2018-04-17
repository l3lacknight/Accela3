if(wfTask == "Application Review" && wfStatus == "Approved"){
	var pId = getParent();
	if(pId){
		updateCert("PERMDISCON");
		removeASITable("EQUIPMENT LIST", pId);
	}
}