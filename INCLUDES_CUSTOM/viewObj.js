function viewObj(obj){
	var outputArray = [];
	for(var key in obj){
		if(typeof obj[key] == 'function')
			outputArray.push(key + '()');
		else
			outputArray.push(key + ": " + obj[key]);
	}
	outputArray.sort();
	for(i=1;i<outputArray.length;i++){
		logDebug(outputArray[i]);
	}
}