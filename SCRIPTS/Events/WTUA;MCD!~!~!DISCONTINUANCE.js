if(wfTask == "Application Review" && wfStatus == "Accepted"){
	
	if(AInfo["Type"] == "Portional" && AInfo["Duration"] == "Permanent"){
		updateCert("DISCONTINUANCE");
	}
	
	if(AInfo["Type"] == "Full" && AInfo["Duration"] == "Permanent"){
		updateCert("PERMDISCON");
	}
	
	if(AInfo["Type"] == "Full" && AInfo["Duration"] == "Temporary"){
		updateCert("TEMPDISCON");
	}
}