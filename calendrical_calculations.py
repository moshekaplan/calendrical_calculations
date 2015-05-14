# Sourced from: http://emr.cs.iit.edu/~reingold/calendar.C
# The following C++ code is translated from the Lisp code
# in ``Calendrical Calculations'' by Nachum Dershowitz and
# Edward M. Reingold, Software---Practice & Experience,
# vol. 20, no. 9 (September, 1990), pp. 899--928.

# This code is in the public domain, but any use of it
# should publicly acknowledge its source.

# Only contains implementations for GregorianDate and HebrewDate

# Absolute dates

# "Absolute date" means the number of days elapsed since the Gregorian date
# Sunday, December 31, 1 BC. (Since there was no year 0, the year following
# 1 BC is 1 AD.) Thus the Gregorian date January 1, 1 AD is absolute date
# number 1.


#  Gregorian dates

def LastDayOfGregorianMonth(month, year):
  # Compute the last date of the month for the Gregorian calendar.
  
  if month == 2:
    if ((((year % 4) == 0) and ((year % 100) != 0)) or ((year % 400) == 0)):
      return 29
    else:
      return 28
  elif month == 4 or month == 6 or month == 9 or month == 11:
      return 30
  else:
      return 31


class GregorianDate:
  def __init__(self, m, d, y):
      self.month = m
      self.day = d
      self.year = y
  
  @staticmethod
  def from_absolute(d):
    # Computes the Gregorian date from the absolute date.
    
    # Search forward year by year from approximate year
    year = d/366
    while (d >= GregorianDate(1,1,year+1).to_absolute()):
      year += 1
    # Search forward month by month from January
    month = 1
    while (d > GregorianDate(month, LastDayOfGregorianMonth(month,year), year).to_absolute()):
      month += 1
    
    day = d - GregorianDate(month,1,year).to_absolute() + 1
    
    return GregorianDate(month, day, year)
  
  def to_absolute(self):
    # Computes the absolute date from the Gregorian date.
    N = self.day           # days this month
    m = self.month - 1
    while (m > 0): # days in prior months this year
      N = N + LastDayOfGregorianMonth(m, self.year)
      m -= 1
    return (N                    # days this year
       + 365 * (self.year - 1)   # days in previous years ignoring leap days
       + (self.year - 1)/4       # Julian leap days before this year...
       - (self.year - 1)/100     # ...minus prior century years...
       + (self.year - 1)/400)   # ...plus prior years divisible by 400


# Hebrew dates

HebrewEpoch = -1373429 # Absolute date of start of Hebrew calendar

def HebrewLeapYear(year):
  # True if year is an Hebrew leap year
  if ((((7 * year) + 1) % 19) < 7):
    return True;
  else:
    return False;

def LastMonthOfHebrewYear(year):
  # Last month of Hebrew year.
  if (HebrewLeapYear(year)):
    return 13;
  else:
    return 12;

def HebrewCalendarElapsedDays(year):
# Number of days elapsed from the Sunday prior to the start of the
# Hebrew calendar to the mean conjunction of Tishri of Hebrew year.
  
  MonthsElapsed = ((235 * ((year - 1) / 19)) +     # Months in complete cycles so far.
    (12 * ((year - 1) % 19)) +                    # Regular months in this cycle.
    (7 * ((year - 1) % 19) + 1) / 19)             # Leap months this cycle
  PartsElapsed = 204 + 793 * (MonthsElapsed % 1080)
  HoursElapsed = 5 + 12 * MonthsElapsed + 793 * (MonthsElapsed  / 1080) \
    + PartsElapsed / 1080;
  ConjunctionDay = 1 + 29 * MonthsElapsed + HoursElapsed / 24;
  ConjunctionParts = 1080 * (HoursElapsed % 24) + PartsElapsed % 1080;
  
  AlternativeDay = None
  if ((ConjunctionParts >= 19440)             # If new moon is at or after midday,
      or (((ConjunctionDay % 7) == 2)         # ...or is on a Tuesday...
          and (ConjunctionParts >= 9924)      # at 9 hours, 204 parts or later...
          and not (HebrewLeapYear(year)))     # ...of a common year,
      or (((ConjunctionDay % 7) == 1)         # ...or is on a Monday at...
          and (ConjunctionParts >= 16789)     # 15 hours, 589 parts or later...
          and (HebrewLeapYear(year - 1)))):   # at the end of a leap year
    # Then postpone Rosh HaShanah one day
    AlternativeDay = ConjunctionDay + 1;
  else:
    AlternativeDay = ConjunctionDay;

  if (((AlternativeDay % 7) == 0)# If Rosh HaShanah would occur on Sunday,
      or ((AlternativeDay % 7) == 3)     # or Wednesday,
      or ((AlternativeDay % 7) == 5)):    # or Friday
    # Then postpone it one (more) day
    return (1 + AlternativeDay);
  else:
    return AlternativeDay;


def DaysInHebrewYear(year):
  # Number of days in Hebrew year.
  
  return ((HebrewCalendarElapsedDays(year + 1)) -
          (HebrewCalendarElapsedDays(year)));

def LongHeshvan(year):
  # True if Heshvan is long in Hebrew year.

  if ((DaysInHebrewYear(year) % 10) == 5):
    return True;
  else:
    return False;


def ShortKislev(year):
# True if Kislev is short in Hebrew year.
  
  if ((DaysInHebrewYear(year) % 10) == 3):
    return True;
  else:
    return False;

def LastDayOfHebrewMonth(month, year):
# Last day of month in Hebrew year.
  
  if ((month == 2)
      or (month == 4)
      or (month == 6)
      or ((month == 8) and not (LongHeshvan(year)))
      or ((month == 9) and ShortKislev(year))
      or (month == 10)
      or ((month == 12) and not (HebrewLeapYear(year)))
      or (month == 13)):
    return 29;
  else:
    return 30;


class HebrewDate:
  def __init__(self, m, d, y):
    self.month = m; # 1..LastMonthOfHebrewYear(year)
    self.day = d;   # 1..LastDayOfHebrewMonth(month, year)
    self.year = y;  # 1...
    
  @staticmethod
  def from_absolute(d):
    # Computes the Hebrew date from the absolute date.
    year = (d + HebrewEpoch) / 366; # Approximation from below.
    # Search forward for year from the approximation.
    while (d >= HebrewDate(7, 1, year + 1).to_absolute()):
      year += 1;
    
    # Search forward for month from either Tishri or Nisan.
    if (d < HebrewDate(1, 1, year).to_absolute()):
      month = 7;  #  Start at Tishri
    else:
      month = 1;  #  Start at Nisan
    while (d > HebrewDate(month, (LastDayOfHebrewMonth(month, year)), year).to_absolute()):
      month += 1;
    
    # Calculate the day by subtraction.
    day = d - HebrewDate(month, 1, year).to_absolute() + 1;
    return HebrewDate(month, day, year)
  
  
  def to_absolute(self):
    # Computes the absolute date of Hebrew date.
    DayInYear = self.day; # Days so far this month.
    
    if (self.month < 7): # Before Tishri, so add days in prior months
                     # this year before and after Nisan.
      m = 7;
      while (m <= (LastMonthOfHebrewYear(self.year))):
        DayInYear = DayInYear + LastDayOfHebrewMonth(m, self.year);
        m += 1;
      m = 1;
      while (m < self.month):
        DayInYear = DayInYear + LastDayOfHebrewMonth(m, self.year);
        m += 1;
      
    
    else: # Add days in prior months this year
      m = 7;
      while (m < self.month):
        DayInYear = DayInYear + LastDayOfHebrewMonth(m, self.year)
        m += 1;
    
    return (DayInYear +
            (HebrewCalendarElapsedDays(self.year)# Days in prior years.
             + HebrewEpoch));         # Days elapsed before absolute date 1.
  

def main():
  
    g_year =  2015
    g_month = 5
    g_day = 13
    
    gdate = GregorianDate(g_month, g_day, g_year)
    g_absolute = gdate.to_absolute()
    
    hdate = HebrewDate.from_absolute(g_absolute)
    
    print "%d/%d/%d on the Gregorian calendar is %d/%d/%d on the hebrew calendar" % (gdate.year, gdate.month, gdate.day, hdate.year, hdate.month, hdate.day)
    
    

if __name__ == '__main__':
  main()
