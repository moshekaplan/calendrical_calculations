package com.moshekaplan.DateConveter;

public class GregorianDate {
	public static int DaysInMonth(int month, int year) {
		// Compute the last date of the month for the Gregorian calendar.
		  
		  switch (month) {
		  case 2:
		    if ((((year % 4) == 0) && ((year % 100) != 0))
		        || ((year % 400) == 0))
		      return 29;
		    else
		      return 28;
		  case 4:
		  case 6:
		  case 9:
		  case 11: return 30;
		  default: return 31;
		  }
		}

		private int year;   // 1...
		private int month;  // 1 == January, ..., 12 == December
		private int day;    // 1..LastDayOfGregorianMonth(month, year)
		  
		public  GregorianDate(int m, int d, int y) { month = m; day = d; year = y; }
		  
		public GregorianDate(int d) { // Computes the Gregorian date from the absolute date.
		    
		    // Search forward year by year from approximate year
		    year = d/366;
		    while (d >= new GregorianDate(1,1,year+1).toAbsolute())
		      year++;
		    // Search forward month by month from January
		    month = 1;
		    while (d > new GregorianDate(month, DaysInMonth(month,year), year).toAbsolute())
		      month++;
		    day = d - new GregorianDate(month,1,year).toAbsolute() + 1;
		  }
		
	  public int toAbsolute(){ // Computes the absolute date from the Gregorian date.
		    int N = day;           // days this month
		    for (int m = month - 1;  m > 0; m--) // days in prior months this year
		      N = N + DaysInMonth(m, year);
		    return
		      (N                    // days this year
		       + 365 * (year - 1)   // days in previous years ignoring leap days
		       + (year - 1)/4       // Julian leap days before this year...
		       - (year - 1)/100     // ...minus prior century years...
		       + (year - 1)/400);   // ...plus prior years divisible by 400
		  }
		  
		  int GetMonth() { return month; }
		  int GetDay() { return day; }
		  int GetYear() { return year; }

		public String toString() {
		  String c = GetMonth() + "/" + GetDay() + "/" + GetYear();
		  return c;
		};
}
