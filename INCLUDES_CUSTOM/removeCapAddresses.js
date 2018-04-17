function removeCapAddresses(capId){
	var addrScriptResult = aa.address.getAddressByCapId(capId);
	if(addrScriptResult.getSuccess()){
		var authAddrList = addrScriptResult.getOutput()
		if(authAddrList.length > 0){
			//get address ID
			for(addr in authAddrList){
				var thisAddr = authAddrList[addr];
				var thisAddrId = thisAddr.getAddressId();
				//remove address from Authority
				aa.address.removeAddress(capId, thisAddrId);
			}
		}else{
			logDebug("No addresses on cap");
			return;
		}
	}else{
		logDebug("Could not get address list from cap");
		return;
	}
	if(aa.address.getAddressByCapId(capId).getOutput().length == 0){
		logDebug("Addresses successfully removed from cap");
	}else{
		logDebug("Addresses were not removed from cap");
	}
}