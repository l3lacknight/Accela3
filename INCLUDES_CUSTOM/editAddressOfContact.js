function editAddressOfContact(cType, aType, licCapId, addr1, addr2, city, state, zip) {
	// edits or adds an address to a contact of the specified type
	var conToChange = null; 
	consResult = aa.people.getCapContactByCapID(licCapId);
	if (consResult.getSuccess()) {
		cons = consResult.getOutput();
		for (thisCon in cons) {
			if (cons[thisCon].getCapContactModel().getPeople().getContactType() == cType) { 
				conToChange = cons[thisCon].getCapContactModel(); 
				contactNbr = conToChange.getContactSeqNumber(); 
				refContactNbr = conToChange.getRefContactNumber();  
				p = conToChange.getPeople(); 
				contactAddressListResult = aa.address.getContactAddressListByCapContact(conToChange);
				if (contactAddressListResult.getSuccess()) { 
					contactAddressList = contactAddressListResult.getOutput();
					foundAddressType = false;
					for (var x in contactAddressList) {
						cal= contactAddressList[x];
						addrType = cal.getAddressType();
						if (addrType == aType) {
							foundAddressType = true;
							contactAddressID = cal.getAddressID();
							cResult = aa.address.getContactAddressByPK(cal.getContactAddressModel());
							if (cResult.getSuccess()) {
								casm = cResult.getOutput(); // contactAddressScriptModel
								casm.setAddressLine1(addr1);
								casm.setAddressLine2(addr2);
								casm.setCity(city);
								casm.setState(state);
								casm.setZip(zip);
								aa.address.editContactAddress(casm.getContactAddressModel());
							}
						}
					}
					convertedContactAddressList = convertContactAddressModelArr(contactAddressList);
					if (foundAddressType) {
						p.setContactAddressList(convertedContactAddressList);
						conToChange.setPeople(p); 
						editResult = aa.people.editCapContactWithAttribute(conToChange);
						if (!editResult.getSuccess()) logDebug("error modifying existing contact : " + editResult.getErrorMessage());
					}
					else {	// address doesn't exist, create a new one
						var newadd = aa.proxyInvoker.newInstance("com.accela.orm.model.address.ContactAddressModel").getOutput();
    						newadd.setEntityType("CONTACT");
						newadd.setEntityID(parseFloat(contactNbr));
						newadd.setAddressType(aType);
    						newadd.setAddressLine1(addr1);
    						newadd.setAddressLine2(addr2);
    						newadd.setCity(city);
   						newadd.setState(state);
    						newadd.setZip(zip);
						//newadd.setPhone(phone);
						createResult = aa.address.createCapContactAddress(licCapId, newadd);
						if (createResult.getSuccess()) {
							newAddrObj = createResult.getOutput();
							if (newAddrObj != null) {
								cam = newAddrObj.getContactAddressModel();
								auditModel = cam.getAuditModel();
								caPKModel = cam.getContactAddressPK();
								newadd.setAuditModel(auditModel);
								newadd.setContactAddressPK(caPKModel);
								newContactAddrList = aa.util.newArrayList();
								for (loopk in contactAddressList) newContactAddrList.add(contactAddressList[loopk].getContactAddressModel());
								newContactAddrList.add(newadd);
								p.setContactAddressList(newContactAddrList);
								conToChange.setPeople(p); 
								editResult = aa.people.editCapContactWithAttribute(conToChange);
								if (!editResult.getSuccess()) logDebug("error adding a new address to a contact : " + editResult.getErrorMessage());
							}
						}
						else {
							logDebug("Error creating a new cap contact address " + createResult.getErrorMessage());
						}
					}
				}
			}
		}
	}
}