import { style } from '@angular/animations';
import { Time } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SelectMultipleControlValueAccessor } from '@angular/forms';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';
import { ScheduleMap } from './scheduleMap';

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

  public scheduleMap: ScheduleMap[] = [];

  //row
  public times = [
    10.5,
    11,
    11.5,
    12,
    12.5
  ];
  
  

  //Palate of colors to choose from
  public colors = ["#96ffcb","#ffe186","#ffc2e1","#ffb296","#9cd2ff"];


  constructor(private employeeService: EmployeeService){
  }

  onNavSwitch(num: number): void {
    if(num === 1) {
      this.nav1Active="active";
      this.nav2Active="";
    }
    if(num === 2) {
      this.nav2Active="active";
      this.nav1Active=""
    }
  }
 
  ngOnInit() {
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

  onClickSchedule(employee: Employee, time: number): void {

    //Give employees colors
    this.assignEmployeeColors();

    // Find element by unique combination of time and employee UUID 
    const button = document.getElementById(employee.id+'-'+time);
    

    //User clicked button
    if(button?.getAttribute('style') == null || button?.getAttribute('style') == '') {
      button?.setAttribute('style', 'background: ' + employee.color);

      //Add time to existing employee
      const times = this.scheduleMap.find(sm => sm.id === employee.id)?.times.push(time);

      //If employee doesn't exist create one
      if(this.scheduleMap.find(sm => sm.id === employee.id) == null){
        this.scheduleMap?.push({
          id: employee.id,
          times: [time],
          shiftStart: undefined,
          shiftEnd: undefined
        })
      }
      

    }
    else { //user unclicked button
      button?.setAttribute('style', '');

      //find employee in array in scheduleMaps and return if undefined
      if(this.scheduleMap?.find(sm => sm.id === employee.id) == undefined) return;
      const times = this.scheduleMap?.find(sm => sm.id === employee.id)!.times;
      
      //remove time from array
      for(var i: number = 0; i < times.length; i++)
        if(times[i] == time) times.splice(i);

      
    } 

    console.log(this.scheduleMap);
      
  }

  totalHours(employee: Employee): string {
    var total: number = 0;
    this.scheduleMap
      .find(sm => sm.id === employee.id)?.times
      .forEach(() => total = total + 1 * this.timeInterval);
    return total + " hours";
  }

  parseTimeToString(time: number): string {
    var minutes: number = time % 1;
    var hours: number = time - minutes;

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

  concatTimes(scheduleMap: ScheduleMap) {
    var id: string = scheduleMap.id;
    var times: number[] = scheduleMap.times;

    for(var i: number = 0; i < times.length; i++) {
      for(var j: number = 0; j < times.length; j++) { 
        if(times[i]-times[j] == this.timeInterval){
          
        }
      }
    }

  }
  
}
