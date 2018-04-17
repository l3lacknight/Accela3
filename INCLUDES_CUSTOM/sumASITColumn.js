function sumASITColumn(tObj, cNameToSum) { // tObj = variable for loadASITable(), cNameToSum = ASIT column name to sum
	// 03.02.2015 CG updated to evaluate 0,1 or 2 columns: optional params = cFilterType, cNameFilter, cValueFilter, cFilterType2, cNameFilter2, cValueFilter2
	var retValue = 0;
	if (tObj) {
		if (arguments.length == 2) { // no filters
			for (var ea in tObj) {
				var row = tObj[ea];
				var colValue = row[cNameToSum].fieldValue;
				if (!isNaN(parseFloat(colValue))) 
					retValue += parseFloat(colValue);
			}
			return retValue;
		}
		if (arguments.length == 5) { // evaluate 1 column
			filterType = arguments[2];
			cNameFilter = arguments[3];
			cValueFilter = arguments[4];
			for (var ea in tObj) {
				var row = tObj[ea];
				var colValue = row[cNameToSum].fieldValue;
				var colFilter = row[cNameFilter].fieldValue;
				if (filterType == "INCLUDE") {
					if (colFilter == cValueFilter) {
						if (!isNaN(parseFloat(colValue))) 
							retValue += parseFloat(colValue);
					}
				}
				if (filterType == "EXCLUDE") {
					if (colFilter != cValueFilter) {
						if (!isNaN(parseFloat(colValue))) 
							retValue += parseFloat(colValue);
					}
				}
			}
			return retValue;
		}
		if (arguments.length == 8) { // evaluate 2 columns
			filterType = arguments[2];
			cNameFilter = arguments[3];
			cValueFilter = arguments[4];
			filterType2 = arguments[5];
			cNameFilter2 = arguments[6];
			cValueFilter2 = arguments[7];
			for (var ea in tObj) {
				var row = tObj[ea];
				var colValue = row[cNameToSum].fieldValue;
				var colFilter = row[cNameFilter].fieldValue;
				var colFilter2 = row[cNameFilter2].fieldValue;
				if ((filterType == "INCLUDE") && (filterType2 == "INCLUDE")) {
					if ((colFilter == cValueFilter) && (colFilter2 == cValueFilter2)) {
						if (!isNaN(parseFloat(colValue))) 
							retValue += parseFloat(colValue);
					}
				}
				if ((filterType == "INCLUDE") && (filterType2 == "EXCLUDE")) {
					if ((colFilter == cValueFilter) && (colFilter2 != cValueFilter2)) {
						if (!isNaN(parseFloat(colValue))) 
							retValue += parseFloat(colValue);
					}
				}
				if ((filterType == "EXCLUDE") && (filterType2 == "EXCLUDE")) {
					if ((colFilter != cValueFilter) && (colFilter2 != cValueFilter2)) {
						if (!isNaN(parseFloat(colValue))) 
							retValue += parseFloat(colValue);
					}
				}
				if ((filterType == "EXCLUDE") && (filterType2 == "INCLUDE")) {
					if ((colFilter != cValueFilter) && (colFilter2 == cValueFilter2)) {
						if (!isNaN(parseFloat(colValue))) 
							retValue += parseFloat(colValue);
					}
				}
			}
			return retValue;
		}
	}
}