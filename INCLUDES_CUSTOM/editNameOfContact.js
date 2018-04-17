function editNameOfContact(cType, lCapId, fName, mName, lName, oName, dbaName){
	var conToChange = null; 
	consResult = aa.people.getCapContactByCapID(lCapId);
	if (consResult.getSuccess()) {
		cons = consResult.getOutput();
		for (thisCon in cons) {
			if (cons[thisCon].getCapContactModel().getPeople().getContactType() == cType) { 
				conToChange = cons[thisCon].getCapContactModel(); 
				contactTypeFlag = conToChange.getContactTypeFlag();
				if (contactTypeFlag == "individual") {
					conToChange.setFirstName(fName);
					conToChange.setLastName(lName);
					conToChange.setMiddleName(mName);
				}
				else {
					conToChange.setBusinessName(oName);
					conToChange.setTradeName(dbaName);
				}
				editResult = aa.people.editCapContactWithAttribute(conToChange);
				if (!editResult.getSuccess()) logDebug("error modifying existing contact : " + editResult.getErrorMessage());
			}
		}
	}
}