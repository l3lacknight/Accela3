function getTodayJs(){
    var toDay = new Date();
    var tDayJs = new Date((toDay.getMonth()+1)+"/"+toDay.getDate()+"/"+toDay.getFullYear());
    return tDayJs;
}