function countASITRows(tObj) {//CG 12.17.2015 -- optional parameters = cName, filterType, cValue, cName2, filterType2, cValue2
	var rowCount = 0;
	if (tObj) {
		if (arguments.length == 1) {
			rowCount = tObj.rows.length;
			return rowCount;
		}
		if (arguments.length == 4) { // count rows with 1 criteria
			cName = arguments[1];
			filterType = arguments[2];
			cValue = arguments[3];
			for (var ea in tObj) {
				var row = tObj[ea];
				var colValue = row[cName].fieldValue;
				if (filterType == "INCLUDE") {
					if (colValue == cValue) {
						rowCount += 1;
					}
				}
				if (filterType == "EXCLUDE") {
					if (colValue != cValue) {
						rowCount += 1;
					}
				}
			}
		return rowCount;
		}
		if (arguments.length == 7) { // count rows with 2 criteria -- cName, filterType, cValue, cName2, filterType2, cValue2
			cName = arguments[1];
			filterType = arguments[2];
			cValue = arguments[3];
			cName2 = arguments[4];
			filterType2 = arguments[5];
			cValue2 = arguments[6];
			for (var ea in tObj) {
				var row = tObj[ea];
				var colValue = row[cName].fieldValue;
				var colValue2 = row[cName2].fieldValue;
				if (filterType == "INCLUDE") {
					if (filterType2 == "INCLUDE") {
						if (colValue == cValue && colValue2 == cValue2) {
							rowCount += 1;
						}
					}
					if (filterType2 == "EXCLUDE") {
						if (colValue == cValue && colValue2 != cValue2) {
							rowCount += 1;
						}
					}
				}	
				if (filterType == "EXCLUDE") {
					if (filterType2 == "INCLUDE") {
						if (colValue != cValue && colValue2 == cValue2) {
							rowCount += 1;
						}
					}
					if (filterType2 == "EXCLUDE") {
						if (colValue != cValue && colValue2 != cValue2) {
							rowCount += 1;
						}
					}
				}
			}
		return rowCount;
		}
	}
}