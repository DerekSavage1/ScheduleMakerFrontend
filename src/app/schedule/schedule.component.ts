import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';

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

    this.employees?.forEach(employee => {
      this.times?.forEach(time => {

        const button = document.getElementById(employee.id+'-'+time);
  
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

    if(timesToCheck.length == count) return false;
    return true;

  }


  public updateTable(employee: Employee) {
    this.times?.forEach(time => {

      const button = document.getElementById(employee.id+'-'+time);

      if(employee.shiftStart == null || employee.shiftEnd == null) {
        button?.setAttribute('style', '');
        return;
      }

      if(employee.shiftStart <= time && time <= employee.shiftEnd) {
        button?.setAttribute('style', 'background: ' + employee.color);
      }
      else {
        button?.setAttribute('style', '');
      }
      
    });
  }

  public onClickSchedule(employee: Employee, time: number): void {

    //Give employees colors
    this.assignEmployeeColors();

    // Find element by unique combination of time and employee UUID 
    const button = document.getElementById(employee.id+'-'+time);



    //Init
    if(employee.shiftStart == null || employee.shiftEnd == null) {
      employee.shiftStart = time;
      employee.shiftEnd = time;
      this.updateTable(employee);
      return;
    }
    else if(employee.shiftEnd == employee.shiftStart && employee.shiftStart == time) {
      employee.shiftStart = null;
      employee.shiftEnd = null;
      this.updateTable(employee);
      return;       
    }
    else if(employee.shiftStart == time) {
      employee.shiftStart = employee.shiftStart + this.timeInterval;
    }
    else if(employee.shiftEnd == time) {
      employee.shiftEnd = employee.shiftEnd - this.timeInterval;
    }
    else if(time < employee.shiftStart) { //flip flopped
      employee.shiftEnd = employee.shiftStart;
      employee.shiftStart = time;
    }
    else if(employee.shiftStart <= time && time <= employee.shiftEnd) { //If inside a clicked segment
      if(employee.shiftStart - time < time - employee.shiftEnd) {
        employee.shiftEnd = employee.shiftEnd + (time - employee.shiftEnd);
      }
      else {
        employee.shiftStart = employee.shiftStart - (employee.shiftStart - time); 
      }
    }

    else employee.shiftEnd = time;

    this.updateTable(employee);
  }

  public totalHours(employee: Employee): string {
    var total: number = 0;
    
    if(employee.shiftEnd == 0 || employee.shiftStart == 0) {
      return this.timeInterval + " hour";
    }
    if(employee.shiftStart == null || employee.shiftEnd == null) {
      return 0 + " hours";
    }

    var adjustedShiftEnd: number = employee.shiftEnd  + 1;
    var netHours: number = Math.abs(employee.shiftStart - adjustedShiftEnd);

    if(netHours > 6)
      return netHours - .5 + " hours";

    return Math.abs(employee.shiftStart - adjustedShiftEnd) + " hours";
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

  public formatShift(employee: Employee): string {
    if(employee.shiftStart == null || employee.shiftEnd == null) return "";
    
    if(employee.shiftEnd == this.times[this.times.length-1]) return this.parseTimeToString(employee.shiftStart) + "–cl";
    return this.parseTimeToString(employee.shiftStart) + "–"+  this.parseTimeToString(employee.shiftEnd);
  }
  
}
