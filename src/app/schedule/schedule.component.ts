import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { find, Observable } from 'rxjs';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';
import { ScheduledDay } from './scheduledDay';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  public nav1Active: String = "active";
  public nav2Active: String = "";
  public employees: Employee[] | undefined;
  public timeInterval: number = .5;
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
  public days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
  public tab: string = "";
  
  public setTab(day: string) :void {
    this.tab = day;
    this.refreshTable(day);
  }  

  refreshTable(day: string) {
    this.employees?.forEach(employee => {
      this.times?.forEach(time => {
        var scheduledDay = employee.scheduledDays?.find(sch => sch.day == day);
        const button = document.getElementById(employee.id+'-'+time+'-'+day);
  
        if(scheduledDay?.shiftStart == null || scheduledDay?.shiftEnd == null) {
          button?.setAttribute('style', '');
          return;
        }
  
        if(scheduledDay?.shiftStart <= time && time <= scheduledDay?.shiftEnd) {
          button?.setAttribute('style', 'background: ' + employee.color);
        }
        else {
          button?.setAttribute('style', '');
        }
        
      });
    });
  }

  //Palate of colors to choose from
  public colors = ["#96ffcb","#ffe186","#ffc2e1","#ffb296","#9cd2ff"];


  constructor(private employeeService: EmployeeService){
  }

  public onNavSwitch(num: number): void {
    if(num === 1) {
      this.nav1Active="active";
      this.nav2Active="";
    }
    if(num === 2) {
      this.nav2Active="active";
      this.nav1Active=""
    }
  }
 
  public ngOnInit() {
    this.getEmployees();
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

  public hasUnfilledRows(): boolean {

    var timesToCheck = Object.assign([], this.times);
    var count: number = 0;

    this.days?.forEach(day => {
      this.employees?.forEach(employee => {
        this.times?.forEach(time => {
  
          const button = document.getElementById(employee.id+'-'+time+'-'+day);
    
          // if button has style, remove it from list of times to check
          if(button?.getAttribute('style') == 'background: ' + employee.color) {
            for(var i = 0; i <= timesToCheck.length; i++) {
              if(timesToCheck[i] === time) {
                delete timesToCheck[i];
                count++;
                break;
              }
            }
  
          }
  
        });
      });
    })

    if(timesToCheck.length == count * this.days.length) return false;
    return true;

  }


  public updateTable(employee: Employee, day: string) {
    this.times?.forEach(time => {

      var scheduledDay = employee.scheduledDays?.find(sch => sch.day == day);
      const button = document.getElementById(employee.id+'-'+time+'-'+day);

      if(scheduledDay?.shiftStart == null || scheduledDay?.shiftEnd == null) {
        button?.setAttribute('style', '');
        return;
      }

      if(scheduledDay?.shiftStart <= time && time <= scheduledDay?.shiftEnd) {
        button?.setAttribute('style', 'background: ' + employee.color);
      }
      else {
        button?.setAttribute('style', '');
      }
      
    });
  }

  public onClickSchedule(employee: Employee, time: number, day: string): void {

    //Give employees colors
    this.assignEmployeeColors();

    // Find element by unique combination of time and employee UUID 
    const button = document.getElementById(employee.id+'-'+time+'-'+day);

    

    //Init if any values are null
    if(employee.scheduledDays == undefined) {
      employee.scheduledDays = [{
        day: day,
        shiftStart: time,
        shiftEnd: time
      }];
      console.log(employee);
      this.updateTable(employee, day);
      return;
    }

    var scheduledDay: ScheduledDay | undefined = employee.scheduledDays.find(sch => sch.day == day);
    
    //Guard against uninitalized scheduleDay
    if(scheduledDay == null) {
      employee.scheduledDays.push({
        day: day,
        shiftStart: time,
        shiftEnd: time
      });
      console.log(employee);
      this.updateTable(employee, day);
      return; 
    }

    //Guard against uninitalized values
    if( scheduledDay.shiftEnd == null || scheduledDay.shiftStart == null) {
      var schDay = employee.scheduledDays.find(sch => sch.day == day);
      schDay!.shiftStart = time;
      schDay!.shiftEnd = time;
      console.log(employee);
      this.updateTable(employee, day);
      return;
    }

    var insideClickedSegment: boolean = (scheduledDay.shiftStart <= time && time <= scheduledDay.shiftEnd);

    

    if(insideClickedSegment) { //Inside logic

      var distFromTop: number = scheduledDay.shiftStart - time;
      var distFromBot: number = time - scheduledDay.shiftEnd;
      if(scheduledDay.shiftStart == scheduledDay.shiftEnd) {
        scheduledDay.shiftEnd = null;
        scheduledDay.shiftStart = null;
      }
      else if(scheduledDay.shiftStart == time) scheduledDay.shiftStart = scheduledDay.shiftStart + this.timeInterval;
      else if(scheduledDay.shiftEnd == time) scheduledDay.shiftEnd = scheduledDay.shiftEnd - this.timeInterval;
      else if(distFromTop <= distFromBot) scheduledDay.shiftEnd = scheduledDay.shiftEnd + distFromBot;
      else scheduledDay.shiftStart = scheduledDay.shiftStart - distFromTop;
    }
    else { //Outside logic
      var above: boolean = time - scheduledDay.shiftStart < 0;

      if(above) {
        scheduledDay.shiftStart = time;
      }
      else scheduledDay.shiftEnd = time;

    }
    


    console.log(employee);
    this.updateTable(employee, day);
  }

  public totalHours(employee: Employee, day: string): string {
    var total: number = 0;

    if(employee.scheduledDays == null) {
      return "0 hours";
    }
    
    var scheduledDay = employee.scheduledDays?.find(sch => sch.day == day);

  
    if(scheduledDay?.shiftStart == null || scheduledDay?.shiftEnd == null)
      return 0 + " hours";
    else if(scheduledDay?.shiftEnd ==  scheduledDay?.shiftStart) {
      if(this.timeInterval == 1) {
        return this.timeInterval + " hour";
      }
      else return this.timeInterval + " hours";
    }


    var adjustedShiftEnd: number = scheduledDay?.shiftEnd  + this.timeInterval;
    var netHours: number = Math.abs(scheduledDay?.shiftStart - adjustedShiftEnd);
    var terminatingString: string = " hours";
    if(netHours == 1) {
      terminatingString = " hour"
    }

    if(netHours > 6)
      return netHours - .5 + terminatingString;


    return Math.abs(netHours) + terminatingString;

  }



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

  public formatShift(employee: Employee, day: string): string {
    
    var scheduledDay = employee.scheduledDays?.find(sch => sch.day == day);

    if(scheduledDay?.shiftStart == null || scheduledDay?.shiftEnd == null) return "";
    
    if(scheduledDay?.shiftEnd == this.times[this.times.length-1]) return this.parseTimeToString(scheduledDay?.shiftStart) + "–cl";
    return this.parseTimeToString(scheduledDay?.shiftStart) + "–"+  this.parseTimeToString(scheduledDay?.shiftEnd);
  }

  cardVisable(day: string): boolean {
    return day == this.tab;
  } 
}
