function removeExistingReleations(itemCap) {// remove the parents from the caps !
   getCapResult = aa.cap.getProjectParents(itemCap, 0);
   if (getCapResult.getSuccess())
   {
      parentArray = getCapResult.getOutput();
	  for( i=0;i<parentArray.length;i++){
		  var linkResult = aa.cap.removeAppHierarchy(parentArray[i].getCapID(), itemCap);
		  if (linkResult.getSuccess())
			logDebug("Successfully removed from Parent Application : " + parentArray[i].getCapID().getCustomID());
		else
			logDebug( "**ERROR: removing from parent application parent cap id (" + parentArray[i].getCapID().getCustomID() + "): " + linkResult.getErrorMessage());
	  }
   }
}