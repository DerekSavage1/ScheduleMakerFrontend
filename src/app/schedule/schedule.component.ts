import { HttpErrorResponse } from '@angular/common/http';
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FontawesomeObject } from '@fortawesome/fontawesome-svg-core';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';
import { Shift } from './shift';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  public employees: Employee[] | undefined;
  
  public timeInterval: number = 1;
  public storeOpen = 10;
  public storeClose = 12+8;
  
  public times: number[] = [];
  public days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  public tab: string = "";
  public colors = ["#96ffcb","#ffe186","#ffc2e1","#ffb296","#9cd2ff"];
  
  constructor(private employeeService: EmployeeService){ }

  public setTab(day: string) :void {
    this.tab = day;
    this.refreshTable(day);
  }

  public isNavActive(day: string) :string {
    if(day == this.tab) return "active";
    return "";
  }

  public isTimeDisabled(employee: Employee, day: string, time: number): boolean {
    const button = document.getElementById(employee.id+'-'+time+'-'+day);
    return button!.classList.contains("disabled");
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
 
  public ngOnInit() {
    
    for(var i: number = this.storeOpen; i <= this.storeClose; i += this.timeInterval) {
      
      this.times.push(i);
      if(i == this.storeClose) this.times.push(this.storeClose + .5);
    }


    this.getEmployees();
  }
 
  public getEmployees(): void {
    this.employeeService.getEmployees().subscribe(
    (responce : Employee[]) => {
      this.employees = responce;
      this.assignEmployeeColors();
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

  public colorTable(employee: Employee, day: string) {
    this.times?.forEach(time => {

      var scheduledDay = employee.scheduledDays?.find(sch => sch.day == day);
      const button = document.getElementById(employee.id+'-'+time+'-'+day);  
      
      if(button == null) return;

      if(employee.scheduledDays?.find(sch => sch.day === day)?.disabled == true) {
        button.classList.add('disabled');

      }
      else {
        if(scheduledDay?.shiftStart == null || scheduledDay?.shiftEnd == null) {
          button.setAttribute('style', 'width: 40px;');
          return;
        }
  
        if(scheduledDay?.shiftStart <= time && time <= scheduledDay?.shiftEnd) {
          button.setAttribute('style', 'width: 40px; background: ' + employee.color);
        }
        else {
          button.setAttribute('style', '');
        }
      }
      
      
    });
  }

  public onClickSchedule(employee: Employee, time: number, day: string): void {

    const button = document.getElementById(employee.id+'-'+time+'-'+day);

    this.changeEmployeeSchedule(employee, time, day)
    
    this.colorTable(employee, day);
  }

  public changeEmployeeSchedule(employee: Employee, time: number, day: string) {
    
    //Init if any values are null
    if(employee.scheduledDays == undefined) {
      employee.scheduledDays = [{
        day: day,
        shiftStart: time,
        shiftEnd: time,
        disabled: true,
        date: undefined
      }];
      this.colorTable(employee, day);
      return;
    }

    var shift: Shift = employee.scheduledDays.find(sch => sch.day == day)!;
    
    //Guard against uninitalized scheduleDay
    if(shift == null) {
      employee.scheduledDays.push({
        day: day,
        shiftStart: time,
        shiftEnd: time,
        disabled: true,
        date: undefined
      });
      this.colorTable(employee, day);
      return; 
    }

    //Guard against uninitalized values
    if( shift.shiftEnd == null || shift.shiftStart == null) {
      var schDay = employee.scheduledDays.find(sch => sch.day == day);
      schDay!.shiftStart = time;
      schDay!.shiftEnd = time;
      this.colorTable(employee, day);
      return;
    }

    var insideClickedSegment: boolean = (shift.shiftStart <= time && time <= shift.shiftEnd);

    if(insideClickedSegment) { //Inside logic
      var distFromTop: number = Math.abs(shift.shiftStart - time);
      var distFromBot: number = Math.abs(time - shift.shiftEnd);
      var shiftOneUnitTall: boolean = shift.shiftStart == shift.shiftEnd;
      var clickedOnTopHalf: boolean = distFromTop < distFromBot;

      if(shiftOneUnitTall) {
        shift.shiftEnd = null;
        shift.shiftStart = null;
      }
      else if(clickedOnTopHalf) {
        if(distFromTop == 0) shift.shiftStart += this.timeInterval; //Clicked on the very top
        else shift.shiftStart += distFromTop;
      }
      else if(!clickedOnTopHalf) {
        if(distFromBot == 0) shift.shiftEnd -= this.timeInterval; //Clicked on the very bottom
        else shift.shiftEnd -= distFromBot;
      }
    }
    else { //Outside logic
      var above: boolean = time - shift.shiftStart < 0;

      if(above) shift.shiftStart = time;
      else shift.shiftEnd = time;
    }
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


    var adjustedShiftEnd: number = scheduledDay?.shiftEnd;
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
