function updateRelationshipToAuthority(){
	var cved = getMPSCNumFromLP();
	logDebug("Relating : "+capIDString+" to the parent Authority: "+cved);
	var urrResult = updateRecordRelation(cved, capIDString, "ADDITION");
	
	if(urrResult){
		logDebug("Relationship updated successfully")
	}else{
		logDebug("***WARNING*** Relationship was not updated")
	}
}