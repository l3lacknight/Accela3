function editPhoneOfLicenseHolder(aType, licCapId, homePhoneNumber, mobilePhoneNumber, businessPhoneNumber) {
	var conToChange = null; 
	consResult = aa.people.getCapContactByCapID(licCapId);
	if (consResult.getSuccess()) {
		cons = consResult.getOutput();
		for (thisCon in cons) {
			if (cons[thisCon].getCapContactModel().getPeople().getContactType() == aType) { 
				conToChange = cons[thisCon].getCapContactModel(); 
				conToChange.setPhone1(homePhoneNumber);
				conToChange.setPhone2(mobilePhoneNumber);
				conToChange.setPhone3(businessPhoneNumber);
				aa.people.editCapContact(conToChange);
			}
		}
	}
}