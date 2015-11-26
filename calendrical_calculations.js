// Sourced from: http://emr.cs.iit.edu/~reingold/calendar.C
// The following C++ code is translated from the Lisp code
// in ``Calendrical Calculations'' by Nachum Dershowitz and
// Edward M. Reingold, Software---Practice & Experience,
// vol. 20, no. 9 (September, 1990), pp. 899--928.

// This code is in the public domain, but any use of it
// should publicly acknowledge its source.

// Only contains implementations for GregorianDate && HebrewDate

// Absolute dates

// "Absolute date" means the number of days elapsed since the Gregorian date
// Sunday, December 31, 1 BC. (Since there was no year 0, the year following
// 1 BC is 1 AD.) Thus the Gregorian date January 1, 1 AD is absolute date
// number 1.

"use strict";

//  Gregorian dates

function LastDayOfGregorianMonth(month, year) {
    // Compute the last date of the month for the Gregorian calendar.

    if (month == 2) {
        if ((((year % 4) == 0) && ((year % 100) != 0)) || ((year % 400) == 0)) {
            return 29;
        } else {
            return 28;
        }
    } else if (month == 4 || month == 6 || month == 9 || month == 11) {
        return 30;
    } else {
        return 31;
    }
}

class GregorianDate {
    constructor(m, d, y) {
        this.month = m;
        this.day = d;
        this.year = y;
    }

    static from_absolute(d) {
        // Computes the Gregorian date from the absolute date.

        // Search forward year by year from approximate year
        var year = Math.floor(d / 366);
        while (d >= (new GregorianDate(1, 1, year + 1)).to_absolute()) {
            year += 1;
        }
        // Search forward month by month from January
        var month = 1
        while (d > (new GregorianDate(month, LastDayOfGregorianMonth(month, year), year)).to_absolute()) {
            month += 1;
        }

        var day = d - (new GregorianDate(month, 1, year)).to_absolute() + 1;

        return new GregorianDate(month, day, year);
    }

    to_absolute() {
        // Computes the absolute date from the Gregorian date.
        var N = this.day; // days this month
        var m = this.month - 1;
        while (m > 0) {
            // days in prior months this year
            N = N + LastDayOfGregorianMonth(m, this.year)
            m -= 1
        }
        return (N // days this year
                + 365 * (this.year - 1) // days in previous years ignoring leap days
                + Math.floor((this.year - 1) / 4) // Julian leap days before this year...
                - Math.floor((this.year - 1) / 100) // ...minus prior century years...
                + Math.floor((this.year - 1) / 400)) // ...plus prior years divisible by 400
    }

}

// Hebrew dates

var HebrewEpoch = -1373429 // Absolute date of start of Hebrew calendar

function HebrewLeapYear(year) {
    // true if year is an Hebrew leap year
    if ((((7 * year) + 1) % 19) < 7) {
        return true;
    } else {
        return false;
    }
}

function LastMonthOfHebrewYear(year) {
    // Last month of Hebrew year.
    if (HebrewLeapYear(year)) {
        return 13;
    } else {
        return 12;
    }
}

function HebrewCalendarElapsedDays(year) {
    // Number of days elapsed from the Sunday prior to the start of the
    // Hebrew calendar to the mean conjunction of Tishri of Hebrew year.

    var MonthsElapsed = ((235 * Math.floor((year - 1) / 19)) + // Months in complete cycles so far.
            (12 * ((year - 1) % 19)) + // Regular months in this cycle.
            Math.floor((7 * ((year - 1) % 19) + 1) / 19)) // Leap months this cycle
    var PartsElapsed = 204 + 793 * (MonthsElapsed % 1080)
    var HoursElapsed = 5 + 12 * MonthsElapsed + 793 * Math.floor(MonthsElapsed / 1080) + Math.floor(PartsElapsed / 1080);
    var ConjunctionDay = 1 + 29 * MonthsElapsed + Math.floor(HoursElapsed / 24);
    var ConjunctionParts = 1080 * (HoursElapsed % 24) + PartsElapsed % 1080;

    var AlternativeDay;
    if ((ConjunctionParts >= 19440) // If new moon is at || after midday,
        || (((ConjunctionDay % 7) == 2) // ...or is on a Tuesday...
            && (ConjunctionParts >= 9924) // at 9 hours, 204 parts || later...
            && !(HebrewLeapYear(year))) // ...of a common year,
        || (((ConjunctionDay % 7) == 1) // ...or is on a Monday at...
            && (ConjunctionParts >= 16789) // 15 hours, 589 parts || later...
            && (HebrewLeapYear(year - 1)))) { // at the end of a leap year
        // Then postpone Rosh HaShanah one day
        AlternativeDay = ConjunctionDay + 1;
    } else {
        AlternativeDay = ConjunctionDay;
    }

    if (((AlternativeDay % 7) == 0) // If Rosh HaShanah would occur on Sunday,
        || ((AlternativeDay % 7) == 3) // || Wednesday,
        || ((AlternativeDay % 7) == 5)) { // || Friday
        // Then postpone it one (more) day
        return (1 + AlternativeDay);
    } else {
        return AlternativeDay;
    }
}

function DaysInHebrewYear(year) {
    // Number of days in Hebrew year.

    return ((HebrewCalendarElapsedDays(year + 1)) -
        (HebrewCalendarElapsedDays(year)));
}

function LongHeshvan(year) {
    // true if Heshvan is long in Hebrew year.

    if ((DaysInHebrewYear(year) % 10) == 5) {
        return true;
    } else {
        return false;
    }
}

function ShortKislev(year) {
    // true if Kislev is short in Hebrew year.

    if ((DaysInHebrewYear(year) % 10) == 3) {
        return true;
    } else {
        return false;
    }
}

function LastDayOfHebrewMonth(month, year) {
    // Last day of month in Hebrew year.

    if ((month == 2) || (month == 4) || (month == 6) || ((month == 8) && !(LongHeshvan(year))) || ((month == 9) && ShortKislev(year)) || (month == 10) || ((month == 12) && !(HebrewLeapYear(year))) || (month == 13)) {
        return 29;
    } else {
        return 30;
    }
}


class HebrewDate {
    constructor(m, d, y) {
        this.month = m; // 1..LastMonthOfHebrewYear(year)
        this.day = d; // 1..LastDayOfHebrewMonth(month, year)
        this.year = y; // 1...
    }

    static from_absolute(d) {
        // Computes the Hebrew date from the absolute date.
        var year = Math.floor((d + HebrewEpoch) / 366); // Approximation from below.
        // Search forward for year from the approximation.
        while (d >= (new HebrewDate(7, 1, year + 1)).to_absolute()) {
            year += 1;
        }
        var month;
        // Search forward for month from either Tishri || Nisan.
        if (d < (new HebrewDate(1, 1, year)).to_absolute()) {
            month = 7; //  Start at Tishri
        } else {
            month = 1; //  Start at Nisan
        }
        while (d > (new HebrewDate(month, (LastDayOfHebrewMonth(month, year)), year)).to_absolute()) {
            month += 1;
        }

        // Calculate the day by subtraction.
        var day = d - (new HebrewDate(month, 1, year)).to_absolute() + 1;
        return new HebrewDate(month, day, year)
    }

    to_absolute() {
        // Computes the absolute date of Hebrew date.
        var DayInYear = this.day; // Days so far this month.

        if (this.month < 7) { // Before Tishri, so add days in prior months
            // this year before && after Nisan.
            var m = 7;
            while (m <= (LastMonthOfHebrewYear(this.year))) {
                DayInYear = DayInYear + LastDayOfHebrewMonth(m, this.year);
                m += 1;
            }
            m = 1;
            while (m < this.month) {
                DayInYear = DayInYear + LastDayOfHebrewMonth(m, this.year);
                m += 1;
            }
        } else { // Add days in prior months this year
            m = 7;
            while (m < this.month) {
                DayInYear = DayInYear + LastDayOfHebrewMonth(m, this.year)
                m += 1;
            }
        }
        return (DayInYear +
            (HebrewCalendarElapsedDays(this.year) // Days in prior years.
                + HebrewEpoch)); // Days elapsed before absolute date 1.
    }
}

// Test demonstration code: Converts the English date of May 13, 2015 to 24th of Iyar, 5775
function main() {

    var g_year = 2015
    var g_month = 5
    var g_day = 13

    var gdate = new GregorianDate(g_month, g_day, g_year)
    var g_absolute = gdate.to_absolute()

    var hdate = HebrewDate.from_absolute(g_absolute)
    // "%d/%d/%d on the Gregorian calendar is %d/%d/%d on the hebrew calendar" % 
    alert([gdate.year, gdate.month, gdate.day, hdate.year, hdate.month, hdate.day])
}
