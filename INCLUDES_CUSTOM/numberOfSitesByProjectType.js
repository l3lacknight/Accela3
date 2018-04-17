function numberOfSitesByProjectType(projectType){
 var numberOfSites = 0;
	for (var i = PROJECTTYPE.length - 1; i >= 0; i--) {
		if (PROJECTTYPE[i]["Project Type"] == projectType && parseInt(PROJECTTYPE[i]["No. of Sites"])> 0){
			numberOfSites +=  parseInt(PROJECTTYPE[i]["No. of Sites"]);
		}
	}
	return numberOfSites
}