package com.moshekaplan.DateConveter;


public class HebrewDate {
	private static int HebrewEpoch = -1373429; // Absolute date of start of Hebrew calendar

	boolean HebrewLeapYear(int year) {
	// True if year is an Hebrew leap year
	  
	  if ((((7 * year) + 1) % 19) < 7)
	    return true;
	  else
	    return false;
	}

	int LastMonthOfHebrewYear(int year) {
	// Last month of Hebrew year.
	  
	  if (HebrewLeapYear(year))
	    return 13;
	  else
	    return 12;
	}

	int HebrewCalendarElapsedDays(int year) {
	// Number of days elapsed from the Sunday prior to the start of the
	// Hebrew calendar to the mean conjunction of Tishri of Hebrew year.
	  
	  int MonthsElapsed =
	    (235 * ((year - 1) / 19))           // Months in complete cycles so far.
	    + (12 * ((year - 1) % 19))          // Regular months in this cycle.
	    + (7 * ((year - 1) % 19) + 1) / 19; // Leap months this cycle
	  int PartsElapsed = 204 + 793 * (MonthsElapsed % 1080);
	  int HoursElapsed =
	    5 + 12 * MonthsElapsed + 793 * (MonthsElapsed  / 1080)
	    + PartsElapsed / 1080;
	  int ConjunctionDay = 1 + 29 * MonthsElapsed + HoursElapsed / 24;
	  int ConjunctionParts = 1080 * (HoursElapsed % 24) + PartsElapsed % 1080;
	  int AlternativeDay;
	  if ((ConjunctionParts >= 19440)        // If new moon is at or after midday,
	      || (((ConjunctionDay % 7) == 2)    // ...or is on a Tuesday...
	          && (ConjunctionParts >= 9924)  // at 9 hours, 204 parts or later...
	          && !(HebrewLeapYear(year)))   // ...of a common year,
	      || (((ConjunctionDay % 7) == 1)    // ...or is on a Monday at...
	          && (ConjunctionParts >= 16789) // 15 hours, 589 parts or later...
	          && (HebrewLeapYear(year - 1))))// at the end of a leap year
	    // Then postpone Rosh HaShanah one day
	    AlternativeDay = ConjunctionDay + 1;
	  else
	    AlternativeDay = ConjunctionDay;
	  if (((AlternativeDay % 7) == 0)// If Rosh HaShanah would occur on Sunday,
	      || ((AlternativeDay % 7) == 3)     // or Wednesday,
	      || ((AlternativeDay % 7) == 5))    // or Friday
	    // Then postpone it one (more) day
	    return (1+ AlternativeDay);
	  else
	    return AlternativeDay;
	}

	int DaysInHebrewYear(int year) {
	// Number of days in Hebrew year.
	  
	  return ((HebrewCalendarElapsedDays(year + 1)) -
	          (HebrewCalendarElapsedDays(year)));
	}

	boolean LongHeshvan(int year) {
	// True if Heshvan is long in Hebrew year.
	  
	  if ((DaysInHebrewYear(year) % 10) == 5)
	    return true;
	  else
	    return false;
	}

	boolean ShortKislev(int year) {
	// True if Kislev is short in Hebrew year.
	  
	  if ((DaysInHebrewYear(year) % 10) == 3)
	    return true;
	  else
	    return false;
	}

	int LastDayOfHebrewMonth(int month, int year) {
	// Last day of month in Hebrew year.
	  
	  if ((month == 2)
	      || (month == 4)
	      || (month == 6)
	      || ((month == 8) && !(LongHeshvan(year)))
	      || ((month == 9) && ShortKislev(year))
	      || (month == 10)
	      || ((month == 12) && !(HebrewLeapYear(year)))
	      || (month == 13))
	    return 29;
	  else
	    return 30;
	}

	private  int year;   // 1...
	private  int month;  // 1..LastMonthOfHebrewYear(year)
	private int day;    // 1..LastDayOfHebrewMonth(month, year)
	  
	public HebrewDate(int m, int d, int y) { month = m; day = d; year = y; }
	  
	 public HebrewDate(int d) { // Computes the Hebrew date from the absolute date.
	    year = (d + HebrewEpoch) / 366; // Approximation from below.
	    // Search forward for year from the approximation.
	    while (d >= new HebrewDate(7,1,year + 1).toAbsolute())
	      year++;
	    // Search forward for month from either Tishri or Nisan.
	    if (d < new HebrewDate(1, 1, year).toAbsolute())
	      month = 7;  //  Start at Tishri
	    else
	      month = 1;  //  Start at Nisan
	    while (d > new HebrewDate(month, (LastDayOfHebrewMonth(month,year)), year).toAbsolute())
	      month++;
	    // Calculate the day by subtraction.
	    day = d - new HebrewDate(month, 1, year).toAbsolute() + 1;
	  }
	  
	  public int toAbsolute() { // Computes the absolute date of Hebrew date.
	    int DayInYear = day; // Days so far this month.
	    if (month < 7) { // Before Tishri, so add days in prior months
	                     // this year before and after Nisan.
	      int m = 7;
	      while (m <= (LastMonthOfHebrewYear(year))) {
	        DayInYear = DayInYear + LastDayOfHebrewMonth(m, year);
	        m++;
	      };
	      m = 1;
	      while (m < month) {
	        DayInYear = DayInYear + LastDayOfHebrewMonth(m, year);
	        m++;
	      }
	    }
	    else { // Add days in prior months this year
	      int m = 7;
	      while (m < month) {
	        DayInYear = DayInYear + LastDayOfHebrewMonth(m, year);
	        m++;
	      }
	    }
	    return (DayInYear +
	            (HebrewCalendarElapsedDays(year)// Days in prior years.
	             + HebrewEpoch));         // Days elapsed before absolute date 1.
	  }
	  
	  int GetMonth() { return month; }
	  int GetDay() { return day; }
	  int GetYear() { return year; }
	  

	public String toString(){
	  String c = GetMonth() + "/" + GetDay() + "/" + GetYear();
	  return c;
	}
}
