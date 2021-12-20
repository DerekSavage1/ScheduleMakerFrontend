import { Time } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';
import { TimeRange } from './timeRange';
import { TimeRangeService } from './timeRange.service';
import {set, isBefore, add, isEqual, addDays, isSunday, format, parse, isAfter } from 'date-fns';
import { publishReplay } from 'rxjs';


@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  public nav1Active: String = "active";
  public nav2Active: String = "";
  public employees: Employee[] | undefined;
  public timeRanges: TimeRange[] = [];

  public storeOpen: Time = {
    hours: 10,
    minutes: 0
  };
  
  
  public storeClose: Time = {
    hours: 20,
    minutes: 0
  };

  public hours: String[] = [];

  public timeIntervalInMinutes: number = 30;

  public times = [
    10,
    10.5,
    11,
    11.5,
    12,
    12.5,
    13,
    13.5,
    14,
    14.5,
    15,
    15.5,
    16,
    16.5,
    17,
    17.5,
    18,
    18.5,
    19,
    19.5,
    20,
    20.5
  ];
  public tab: Date | undefined;
  daysNextWeek: Date[] = [];

  

  
  public setTab(day: Date) :void {
    this.tab = day;
  }

  public isNavActive(day: Date) :string {
    if(day == this.tab) return "active";
    return "";
  }

  public isTimeDisabled(): boolean {
    //not implemented
    return false;
  }

  //Palate of colors to choose from
  public colors = ["#96ffcb","#ffe186","#ffc2e1","#ffb296","#9cd2ff"];


  constructor(private employeeService: EmployeeService, private timeRangeService: TimeRangeService){
  }

  public ngOnInit() {
    this.daysNextWeek = this.getDaysNextWeek();
    this.hours = this.getHours(this.daysNextWeek[0]);
    this.getEmployees();

  }

  getHours(day: Date): string[] {
    var storeOpen: Date = set(new Date(), {year: day.getFullYear(), month: day.getMonth(), date: day.getDate(), hours: this.storeOpen.hours, minutes: this.storeOpen.minutes, seconds: 0, milliseconds: 0});
    var storeClose: Date = set(new Date(), {year: day.getFullYear(), month: day.getMonth(), date: day.getDate(), hours: this.storeClose.hours, minutes: this.storeClose.minutes, seconds: 0, milliseconds: 0});

    var hours: string[] = [];

    var count: number = 0
    for(var i: Date = storeOpen; isBefore(i, storeClose) || isEqual(i, storeClose) ; i = add(i, {minutes: this.timeIntervalInMinutes})) {
      hours.push(this.getHour(i));
      count++;
      if(count > 100) break;
    }

    return hours;
  }

  getDaysNextWeek(): Date[] {

    var nextSunday: Date = set(new Date(), {hours: this.storeClose.hours, minutes: this.storeClose.minutes, seconds: 0, milliseconds: 0});

    while(!isSunday(nextSunday)) {
      nextSunday = addDays(nextSunday,1);
    }
    var dates: Date[] = [];

    for(var i: number = 0; i < 7; i++) dates.push(addDays(nextSunday,i));

    console.log(dates);
    return dates;

  }
 
  public getEmployees(): void {
    this.employeeService.getEmployees().subscribe(
    (responce : Employee[]) => {
      this.employees = responce;
    },
    (error: HttpErrorResponse) => {
      alert(error.message);
    }
    );
  }

  public assignEmployeeColors(): void {
    let count: number = 0;
    this.employees?.forEach(employee => {
      if(count === 5) count = 0;
       employee.color = this.colors[count]
       count++;
    });
  }

  // public hasUnfilledRows(): boolean {
  //   // TODO
  // }



  public colorButton(button: HTMLElement, color: string) {
    button?.setAttribute('style', 'background: ' + color);
  }

  public colorTable(employee: Employee, timeStamp: Date, timeRange: TimeRange) {
    //Check every button for an employee to see if the button is between timeRange start and timeRange end
    this.getHours(timeStamp).forEach(time => {
      const button = document.getElementById(employee.id+'-'+this.getDate(timeStamp)+'-'+time);

      

      var buttonTime: Date = new Date(); //TODO
      if(button == null) return;
      if(this.isBetween(buttonTime, timeRange.dateStart!, timeRange.dateEnd!)) {
        this.colorButton(button, employee.color);
      }
    });

  }

  findEmployeeShiftIndex(employee: Employee, day: Date): number {
    var purpose: string = "shift";

    var index: number | undefined = this.timeRanges.findIndex(tr => (tr.employeeId == employee.id && tr.purpose == purpose));

    if(index == -1) {
      this.timeRanges.push({
        id: undefined,
        employeeId: employee.id,
        dateStart: null,
        dateEnd: null,
        purpose: purpose
      });
    }
    return this.timeRanges.findIndex(tr => (tr.employeeId == employee.id && tr.purpose == purpose));
  }

  addTimeStampToShift(index: number, timeStamp: Date): void {

    let todaysShift = this.timeRanges[index];
    
    if(todaysShift.dateStart == null || todaysShift.dateEnd == null) {
      todaysShift.dateEnd = timeStamp;
      todaysShift.dateStart = timeStamp;
    }
    else if(isBefore(timeStamp, todaysShift.dateStart)) {
      todaysShift.dateStart = timeStamp;
    }
    else if(isAfter(timeStamp, todaysShift.dateEnd)) {
      todaysShift.dateEnd = timeStamp;
    }

  }

  combineDayAndTime(day: Date, timeString:string): Date {
    var time: Date = parse(timeString, 'h:mm', new Date());
    
    return set(new Date(), {year: day.getFullYear(), month: day.getMonth(), date: day.getDate(), hours: time.getHours(), minutes: time.getMinutes(), seconds: 0, milliseconds: 0});
  }

  public onClickSchedule(employee: Employee, day: Date, time:string): void {

    this.assignEmployeeColors();

    const button = document.getElementById(employee.id+'-'+this.getDate(day)+'-'+time);
    if(button == null) return;

    var timeStamp: Date = this.combineDayAndTime(day, time);

    this.colorButton(button, employee.color);
    
    var index: number = this.findEmployeeShiftIndex(employee, timeStamp);
    this.addTimeStampToShift(index, timeStamp);

    console.log(this.timeRanges);
      

    // //Init if any values are null
    // if(employee.scheduledDays == undefined) {
    //   employee.scheduledDays = [{
    //     day: day,
    //     shiftStart: time,
    //     shiftEnd: time,
    //     disabled: false
    //   }];
    //   console.log(employee);
    //   this.colorInTable(employee, day);
    //   return;
    // }

    // var scheduledDay: Shift | undefined = employee.scheduledDays.find(sch => sch.day == day);
    
    // //Guard against uninitalized scheduleDay
    // if(scheduledDay == null) {
    //   employee.scheduledDays.push({
    //     day: day,
    //     shiftStart: time,
    //     shiftEnd: time,
    //     disabled: false
    //   });
    //   console.log(employee);
    //   this.colorInTable(employee, day);
    //   return; 
    // }

    // //Guard against uninitalized values
    // if( scheduledDay.shiftEnd == null || scheduledDay.shiftStart == null) {
    //   var schDay = employee.scheduledDays.find(sch => sch.day == day);
    //   schDay!.shiftStart = time;
    //   schDay!.shiftEnd = time;
    //   console.log(employee);
    //   this.colorInTable(employee, day);
    //   return;
    // }

    // var insideClickedSegment: boolean = (scheduledDay.shiftStart <= time && time <= scheduledDay.shiftEnd);

    

    // if(insideClickedSegment) { //Inside logic

    //   var distFromTop: number = scheduledDay.shiftStart - time;
    //   var distFromBot: number = time - scheduledDay.shiftEnd;
    //   if(scheduledDay.shiftStart == scheduledDay.shiftEnd) {
    //     scheduledDay.shiftEnd = null;
    //     scheduledDay.shiftStart = null;
    //   }
    //   else if(scheduledDay.shiftStart == time) scheduledDay.shiftStart = scheduledDay.shiftStart + this.timeInterval;
    //   else if(scheduledDay.shiftEnd == time) scheduledDay.shiftEnd = scheduledDay.shiftEnd - this.timeInterval;
    //   else if(distFromTop <= distFromBot) scheduledDay.shiftEnd = scheduledDay.shiftEnd + distFromBot;
    //   else scheduledDay.shiftStart = scheduledDay.shiftStart - distFromTop;
    // }
    // else { //Outside logic
    //   var above: boolean = time - scheduledDay.shiftStart < 0;

    //   if(above) {
    //     scheduledDay.shiftStart = time;
    //   }
    //   else scheduledDay.shiftEnd = time;

    // }
    


    // console.log(employee);
    // this.colorInTable(employee, day);
  }

  // public totalHours(employee: Employee, day: string): string {
  //   var total: number = 0;

  //   if(employee.scheduledDays == null) {
  //     return "0 hours";
  //   }
    
  //   var scheduledDay = employee.scheduledDays?.find(sch => sch.day == day);

  
  //   if(scheduledDay?.shiftStart == null || scheduledDay?.shiftEnd == null)
  //     return 0 + " hours";
  //   else if(scheduledDay?.shiftEnd ==  scheduledDay?.shiftStart) {
  //     if(this.timeInterval == 1) {
  //       return this.timeInterval + " hour";
  //     }
  //     else return this.timeInterval + " hours";
  //   }


  //   var adjustedShiftEnd: number = scheduledDay?.shiftEnd  + this.timeInterval;
  //   var netHours: number = Math.abs(scheduledDay?.shiftStart - adjustedShiftEnd);
  //   var terminatingString: string = " hours";
  //   if(netHours == 1) {
  //     terminatingString = " hour"
  //   }

  //   if(netHours > 6)
  //     return netHours - .5 + terminatingString;


  //   return Math.abs(netHours) + terminatingString;

  // }

  public parseTimeToString(time: number): string {
    var minutes: number = time % 1;
    var hours: number = time - minutes;

    if(hours > 12) hours = hours - 12;

    switch(minutes) {
      default:
        return(hours + ":00");
      case .5:
        return(hours + ":30");
      case .25:
        return(hours + ":15");
      case .75:
        return(hours + ":45");
    }
  }

  public formatShift(employee: Employee, day: Date): string {
    
    // var scheduledDay = employee.scheduledDays?.find(sch => sch.day == day);

    // if(scheduledDay?.shiftStart == null || scheduledDay?.shiftEnd == null) return "";
    
    // if(scheduledDay?.shiftEnd == this.times[this.times.length-1]) return this.parseTimeToString(scheduledDay?.shiftStart) + "–cl";
    // return this.parseTimeToString(scheduledDay?.shiftStart) + "–"+  this.parseTimeToString(scheduledDay?.shiftEnd);
    return "unimplemented"
  }

  cardVisable(day: Date): boolean {
    return day == this.tab;
  } 

  public getTimeRanges(): void {
    this.timeRangeService.getTimeRange().subscribe(
    (responce : TimeRange[]) => {
      responce.forEach(tr => {
        tr.dateStart = new Date( tr.dateStart!.getTime() );
        tr.dateEnd = new Date( tr.dateEnd!.getTime() );
      })
      this.timeRanges = responce;
    },
    (error: HttpErrorResponse) => {
      alert(error.message);
    }
    );
  }

  public getDOTW(day: Date): string {
    return format(day, 'EEEE');
  }

  public getHour(day: Date ):string {
    return format(day, "h:mm");
  }

  public isBetween(dateTest: Date, dateStart: Date, dateEnd: Date): boolean {
    return isAfter(dateTest,dateStart) && isBefore(dateTest, dateEnd);
  }

  public getDate(day: Date): string {
    return format(day, "mm/dd/yyy");
  }

}
