function formatDate(dateObj) {
	var dateObjMonth = dateObj.getMonth() +1;
	if (dateObjMonth <= 9)
		dateObjMonth = "0" + dateObjMonth;
	var dateObjDate = dateObj.getDate();
	if (dateObjDate <= 9)
		dateObjDate = "0" + dateObjDate;
	var dateObjHours = dateObj.getHours();
	if (dateObjHours <= 9)
		dateObjHours = "0" + dateObjHours;
	var dateObjMinutes = dateObj.getMinutes();
	if (dateObjMinutes <= 9)
		dateObjMinutes = "0" + dateObjMinutes;
	var dateStrOut = dateObjDate + "." + dateObjMonth + "." + dateObj.getFullYear() + " " + dateObjHours + ":" + dateObjMinutes;
 return  dateStrOut;
}