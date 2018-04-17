function editAddressOfLicenseHolder(aType, licCapId, addr1, addr2, city, state, zip, phone){
	var conToChange = null; 
	consResult = aa.people.getCapContactByCapID(licCapId);
	if (consResult.getSuccess()) {
		cons = consResult.getOutput();
		for (thisCon in cons) {
			if (cons[thisCon].getCapContactModel().getPeople().getContactType() == "License Holder") { 
				conToChange = cons[thisCon].getCapContactModel(); 
				p = conToChange.getPeople(); 
				contactAddressListResult = aa.address.getContactAddressListByCapContact(conToChange);
				if (contactAddressListResult.getSuccess()) { 
					contactAddressList = contactAddressListResult.getOutput();
					for (var x in contactAddressList) {
						cal= contactAddressList[x];
						addrType = "" + cal.getAddressType();
						if (addrType == aType) {
							contactAddressID = cal.getAddressID();
							cResult = aa.address.getContactAddressByPK(cal.getContactAddressModel());
							if (cResult.getSuccess()) {
								casm = cResult.getOutput();
								casm.setAddressLine1(addr1);
								casm.setAddressLine2(addr2);
								casm.setCity(city);
								casm.setState(state);
								casm.setZip(zip);
								casm.setPhone(phone);
								aa.address.editContactAddress(casm.getContactAddressModel());
							}
						}
					}	
					convertedContactAddressList = convertContactAddressModelArr(contactAddressList);
					p.setContactAddressList(convertedContactAddressList);
					conToChange.setPeople(p); 
					aa.people.editCapContactWithAttribute(conToChange);
				}
			}
		}
	}
}