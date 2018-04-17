function compareStatusDateDesc(a,b) {
	if (a.getStatusDate() == null && b.getStatusDate() == null) return 0;
	if (a.getStatusDate() == null && b.getStatusDate() != null) return 1;
	if (a.getStatusDate() != null && b.getStatusDate() == null) return -1;
	return b.getStatusDate().compareTo(a.getStatusDate());
}