function getTodayString(){
    var toDay = new Date();
    var tDay = ((toDay.getMonth()+1)+"/"+toDay.getDate()+"/"+toDay.getFullYear());
    return tDay;
}