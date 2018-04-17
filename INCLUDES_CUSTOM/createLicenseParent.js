function createLicenseParent(grp,typ,stype,cat,desc) { // creates the new application and returns the capID object
	var appCreateResult = aa.cap.createAppRegardlessAppTypeStatus(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess()) {
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
		var result = aa.cap.createAppHierarchy(newId, capId); 
		if (result.getSuccess()) {
			logDebug("Parent application successfully linked");
		}
		else {
			logDebug("Could not link applications");
		}
		// Copy Parcels

		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		if (capParcelResult.getSuccess()) {
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels) {
				logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
				newCapParcel.setParcelModel(Parcels[zz]);
				newCapParcel.setCapIDModel(newId);
				newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
				newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
				aa.parcel.createCapParcel(newCapParcel);
			}
		}

		// Copy Contacts
		var capPeoples = getPeople(capId);
		if (capPeoples != null && capPeoples.length > 0) {
			for (loopk in capPeoples) {
				sourcePeopleModel = capPeoples[loopk];
				sourcePeopleModel.getCapContactModel().setCapID(newId);
				aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
				logDebug("added contact");
			}
		}

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(capId);
		if (capAddressResult.getSuccess()) {
			Address = capAddressResult.getOutput();
			for (yy in Address) {
				newAddress = Address[yy];
				newAddress.setCapID(newId);
				aa.address.createAddress(newAddress);
				logDebug("added address");
			}
		}
		return newId;
	}
	else {
		logDebug( "**ERROR: adding parent App: " + appCreateResult.getErrorMessage());
	}
}