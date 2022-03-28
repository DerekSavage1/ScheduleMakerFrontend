import { Time } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Employee } from "../employee";
import { EmployeeService } from "../employee.service";
import { TimeRange } from "./timeRange";
import { TimeRangeService } from "./timeRange.service";
import {
  set,
  isBefore,
  add,
  isEqual,
  addDays,
  isSunday,
  format,
  parse,
  isAfter,
  differenceInMinutes,
  sub,
} from "date-fns";

@Component({
  selector: "app-schedule",
  templateUrl: "./schedule.component.html",
  styleUrls: ["./schedule.component.css"],
})
export class ScheduleComponent implements OnInit {
  public nav1Active: String = "active";
  public nav2Active: String = "";
  public employees: Employee[] | undefined;
  public timeRanges: TimeRange[] = [];

  public storeOpen: Time = {
    hours: 10,
    minutes: 0,
  };
  public storeClose: Time = {
    hours: 20,
    minutes: 0,
  };
  public hours: String[] = [];
  public timeIntervalInMinutes: number = 30;
  public tab: Date | undefined;
  public daysNextWeek: Date[] = [];

  public colors = ["#96ffcb", "#ffe186", "#ffc2e1", "#ffb296", "#9cd2ff"];

  constructor(
    private employeeService: EmployeeService,
    private timeRangeService: TimeRangeService
  ) {}

  public ngOnInit() {
    this.getTimeRanges();
    this.daysNextWeek = this.getDaysNextWeek();
    this.hours = this.getHours(this.daysNextWeek[0],true);
    this.getEmployees();
  }

  getHours(day: Date, isMilitaryTime: boolean): string[] {
    var storeOpen: Date = set(new Date(), {
      year: day.getFullYear(),
      month: day.getMonth(),
      date: day.getDate(),
      hours: this.storeOpen.hours,
      minutes: this.storeOpen.minutes,
      seconds: 0,
      milliseconds: 0,
    });
    var storeClose: Date = set(new Date(), {
      year: day.getFullYear(),
      month: day.getMonth(),
      date: day.getDate(),
      hours: this.storeClose.hours,
      minutes: this.storeClose.minutes,
      seconds: 0,
      milliseconds: 0,
    });

    var hours: string[] = [];

    var count: number = 0;
    for (
      var i: Date = storeOpen;
      isBefore(i, storeClose) || isEqual(i, storeClose);
      i = add(i, { minutes: this.timeIntervalInMinutes })
    ) {
      if(isMilitaryTime) hours.push(this.getHour(i));
      else hours.push(this.get12Hour(i));
      count++;
      if (count > 100) break;
    }

    return hours;
  }

  getDaysNextWeek(): Date[] {
    var nextSunday: Date = set(new Date(), {
      hours: this.storeClose.hours,
      minutes: this.storeClose.minutes,
      seconds: 0,
      milliseconds: 0,
    });

    while (!isSunday(nextSunday)) {
      nextSunday = addDays(nextSunday, 1);
    }
    var dates: Date[] = [];

    for (var i: number = 0; i < 7; i++) dates.push(addDays(nextSunday, i));


    return dates;
  }

  public getEmployees(): void {
    this.employeeService.getEmployees().subscribe(
      (responce: Employee[]) => {
        this.employees = responce;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  public assignEmployeeColors(): void {
    let count: number = 0;
    this.employees?.forEach((employee) => {
      if (count === 5) count = 0;
      employee.color = this.colors[count];
      count++;
    });
  }
  
  getShiftsByDay(day: Date) {
    
    var dayStart: Date = set(new Date(), {
      year: day.getFullYear(),
      month: day.getMonth(),
      date: day.getDate(),
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    var dayEnd: Date = set(new Date(), {
      year: day.getFullYear(),
      month: day.getMonth(),
      date: day.getDate(),
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 59,
    });

    var shifts: TimeRange[] = [];

    this.timeRanges.forEach((tr) => {
      if(tr.dateEnd == null || tr.dateStart == null) return;
      if(this.isBetween(tr.dateEnd, dayStart, dayEnd)
      || this.isBetween(tr.dateStart, dayStart, dayEnd)) {
        shifts.push(tr);
      }
    });
    
    return shifts;
  }

  public totalHours(day: Date, employee: Employee): string {
    var shifts: TimeRange[] = this.getShiftsByDay(day);
    var numMinutes: number = 0;
    shifts.forEach((shift) => {
      if(shift.purpose != "shift") return;
      if(shift.dateEnd == null || shift.dateStart == null) return;
      if(shift.employeeId != employee.id) return;
      numMinutes = differenceInMinutes(shift.dateEnd, shift.dateStart);
    });

    if(numMinutes > 6 * 60) numMinutes -= 30;
    var numHours: number = Math.trunc(numMinutes / 60);
    numMinutes = numMinutes - numHours * 60;

    return numHours + "h " + numMinutes + "m"; 

  }

  public colorButton(button: HTMLElement, color: string) {
    button?.setAttribute("style", "background: " + color);
  }

  public colorTable(employee: Employee, timeStamp: Date, timeRange: TimeRange) {
    //Check every button for an employee to see if the button is between timeRange start and timeRange end
    this.getHours(timeStamp, true).forEach((time) => {
      const button = document.getElementById(
        employee.id + "+" + this.getDate(timeStamp) + "-" + time
      );
      if (button == null) return;

      var buttonTimeString: string = button.id.split("+")[1];
      var buttonTime: Date = parse(
        buttonTimeString,
        "MM/dd/yyyy-H:mm",
        new Date()
      );
      
      this.colorButton(button, "");
      if (this.isBetween(buttonTime, timeRange.dateStart!, timeRange.dateEnd!)) {
        this.colorButton(button, employee.color);
      }
    });
  }

  public updateSchedule() {
    //for each cell in the schedule, color in or disable altered cells
    

    this.timeRanges.forEach((timeRange) => {
      if(timeRange.dateEnd == null || timeRange.dateStart == null) return;
      var employeeID = timeRange.employeeId;
      const dates: Date[] = this.getOpenHoursBetweenDates(timeRange.dateStart, timeRange.dateEnd);

      dates.forEach((date) => {
        const button = document.getElementById(
          employeeID + "+" + this.getDate(date) + "-" + this.getHour(date)
        );
        if(button == null) return;
        
        if(timeRange.purpose == "OFF") {
          console.log(button);
          button.classList.add('disabled');
          button.innerHTML = "<i class=\"fas fa-times\"></i>";
        }
        
      })


      //then loop through the timestamps and alter the buttons

    });

    //To locate a single cell, you need 3 pieces of data
    //Employee UUID
    //Date eg. 3/12/2021
    //Time eg. 16:30
  }

  getOpenHoursBetweenDates(dateStart: Date, dateEnd: Date): Date[] {

    if(isBefore(dateEnd, dateStart)) {
      var temp: Date = dateStart;
      dateStart = dateEnd;
      dateEnd = temp;
    }
    let minutesBetweenDates: number = Math.abs(differenceInMinutes(dateStart, dateEnd));

    //dateStart minutes should be divisable by the time interval ie (Time interval 30m, then date start 10:15 NO)
    while(dateStart.getMinutes() % this.timeIntervalInMinutes != 0) {
      dateStart = add(dateStart, {minutes: 1});
    };

    var dates: Date[] = []



    for(var i: number = 0; i <= minutesBetweenDates; i += this.timeIntervalInMinutes){ 

      var date: Date = add(dateStart, {minutes: i});

      var storeOpen: Date = set(new Date(), {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
        hours: this.storeOpen.hours,
        minutes: this.storeOpen.minutes,
        seconds: 0,
        milliseconds: 0,
      });
      var storeClose: Date = set(new Date(), {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
        hours: this.storeClose.hours,
        minutes: this.storeClose.minutes,
        seconds: 0,
        milliseconds: 0,
      });

      
      if(this.isBetween(date, storeOpen, storeClose) || date.getHours() == storeClose.getHours() && date.getMinutes() == storeClose.getMinutes()) dates.push(date);
    }
    

    return dates;
  }

  findEmployeeShift(employee: Employee, clickedTime: Date): TimeRange {
    var purpose: string = "shift";
    const newTimeShift: TimeRange = {
      id: undefined,
      employeeId: employee.id,
      dateStart: null,
      dateEnd: null,
      purpose: purpose,
    };
    
    var timeRange: TimeRange | undefined = this.timeRanges.find((targetShift) =>{
      if(targetShift.employeeId == employee.id
        && targetShift.purpose == purpose
        && targetShift.dateStart != null 
        && targetShift.dateEnd != null
        && this.getDate(targetShift.dateStart) == this.getDate(clickedTime)
        && this.getDate(targetShift.dateEnd) == this.getDate(clickedTime))
      return targetShift;
      return undefined;
    });

    if(timeRange == undefined) {
      return newTimeShift;
    } 
    return timeRange;
    
  }

  addTimeStampToShift(todaysShift: TimeRange, timeStamp: Date): void {
    
    var dayStart: Date = set(new Date(), {
      year: timeStamp.getFullYear(),
      month: timeStamp.getMonth(),
      date: timeStamp.getDate(),
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    var dayEnd: Date = set(new Date(), {
      year: timeStamp.getFullYear(),
      month: timeStamp.getMonth(),
      date: timeStamp.getDate(),
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 59,
    });

    

    if (todaysShift.dateStart == null || todaysShift.dateEnd == null) {
      todaysShift.dateEnd = timeStamp;
      todaysShift.dateStart = timeStamp;
      return;
    }
    


    var insideClickedSegment: boolean = (this.isBetween(timeStamp , todaysShift.dateStart ,todaysShift.dateEnd));

    if(insideClickedSegment) {
      var distFromTop: number = Math.abs(differenceInMinutes(timeStamp, todaysShift.dateStart));
      var distFromBot: number = Math.abs(differenceInMinutes(timeStamp, todaysShift.dateEnd));

      var clickedTopHalf: boolean = distFromTop <= distFromBot;

      if(isEqual(todaysShift.dateStart, todaysShift.dateEnd)) {
        todaysShift.dateEnd = null;
        todaysShift.dateStart = null;
      }
      else if(distFromTop == 0) todaysShift.dateStart = add(todaysShift.dateStart, {minutes: this.timeIntervalInMinutes});
      else if(distFromBot == 0) todaysShift.dateEnd = sub(todaysShift.dateEnd, {minutes: this.timeIntervalInMinutes});
      else if(clickedTopHalf) todaysShift.dateStart = add(todaysShift.dateStart, {minutes: distFromTop});
      else todaysShift.dateEnd = sub(todaysShift.dateEnd, {minutes: distFromBot});
    }
    else { //Outside logic
      if (isBefore(timeStamp, todaysShift.dateStart)) {
        todaysShift.dateStart = timeStamp;
      } else if (isAfter(timeStamp, todaysShift.dateEnd)) {
        todaysShift.dateEnd = timeStamp;
      }

    }

  }

  combineDayAndTime(day: Date, timeString: string): Date {
    var time: Date = parse(timeString, "H:mm", new Date());

    return set(new Date(), {
      year: day.getFullYear(),
      month: day.getMonth(),
      date: day.getDate(),
      hours: time.getHours(),
      minutes: time.getMinutes(),
      seconds: 0,
      milliseconds: 0,
    });
  }

  public onClickSchedule(employee: Employee, day: Date, time: string): void {
    this.assignEmployeeColors();

    const button = document.getElementById(
      employee.id + "+" + this.getDate(day) + "-" + time
    );
    if (button == null) return;

    var clickedTime: Date = this.combineDayAndTime(day, time);

    const employeeShift: TimeRange = this.findEmployeeShift(
      employee,
      clickedTime
    );
    if(employeeShift.dateEnd == null) this.timeRanges.push(employeeShift);
    

    this.addTimeStampToShift(employeeShift, clickedTime);


    this.colorTable(employee, clickedTime, employeeShift);
  }

  timeRangeContainsNullValues(timeRange: TimeRange):boolean {
    return(timeRange.dateStart == null || timeRange.dateEnd == null);
  }

  public formatShift(employee: Employee, day: Date): string {
    var shift: TimeRange = this.findEmployeeShift(employee, day);
    if(this.timeRangeContainsNullValues(shift)) return "";

    return format(shift.dateStart!, "h:mm") + "-" + format(shift.dateEnd!, "h:mm");
  }

  public getTimeRanges(): void {
    this.timeRangeService.getTimeRange().subscribe(
      (responce: TimeRange[]) => {
        responce.forEach((tr) => {
          if(tr.dateStart != null && tr.dateEnd != null) {
            tr.dateStart = new Date(tr.dateStart);
            tr.dateEnd = new Date(tr.dateEnd);
          }
        });
        this.timeRanges = responce;
        this.updateSchedule();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  //============DATE FORMATTING==============

  public getDOTW(day: Date): string {
    return format(day, "EEEE");
  }

  public getHour(day: Date): string {
    return format(day, "H:mm");
  }
  
  public get12Hour(day: Date): string {
    return format(day, "h:mm");
  }

  public isBetween(dateTest: Date, dateStart: Date, dateEnd: Date): boolean {
    return (
      (isAfter(dateTest, dateStart) && isBefore(dateTest, dateEnd)) ||
      isEqual(dateTest, dateEnd) ||
      isEqual(dateTest, dateStart)
    );
  }

  public getDate(day: Date): string {
    return format(day, "MM/dd/yyy");
  }

  // ===========NAV==============
  public setTab(day: Date): void {
    this.daysNextWeek.forEach((tabDay) => {
      var tab = document.getElementById("nav-" + tabDay);
      if (tabDay == day) tab?.classList.add("active");
      else tab?.classList.remove("active");
    });
    this.updateSchedule();
    this.tab = day;
    
  }

  cardVisable(day: Date): boolean {
    return day == this.tab;
  }


}
