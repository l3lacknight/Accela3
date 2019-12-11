var tDay = new Date(); 
var today = dateFormatted(tDay.getMonth()+1,tDay.getDate(),tDay.getFullYear());
var tomorrow = dateAdd(today,1);

if(matches(AInfo["Start Date"],today,tomorrow)){
	updateAppStatus("Active", "set by script");
}

if(Date.parse(AInfo["Start Date"]) > Date.parse(tomorrow)){
	updateAppStatus("Pending", "set by script");
}

