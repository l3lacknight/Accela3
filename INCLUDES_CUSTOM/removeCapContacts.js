function removeCapContacts(recordCapId){
	var conCount = 0;
	var cons = aa.people.getCapContactByCapID(recordCapId).getOutput();
	for(x in cons){
		conSeqNum = cons[x].getPeople().getContactSeqNumber();
		aa.people.removeCapContact(recordCapId, conSeqNum);
		conCount++;
	}
	logDebug(conCount+" Contacts Removed");
}