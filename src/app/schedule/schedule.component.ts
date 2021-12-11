import { Time } from '@angular/common';
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

  public employees: Employee[] | undefined;

  //row
  public times = ["10:00","11:00", "12:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00"];

  //Palate of colors to choose from
  public colors = ["#96ffcb","#ffe186","#ffc2e1","#ffb296","#9cd2ff"];


  constructor(private employeeService: EmployeeService){
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
       console.log(employee.color);
    });
    
  }

  onClickSchedule(employee: Employee, time: string): void {

    //Give employees colors
    this.assignEmployeeColors();

    // Find element by unique combination of time and employee UUID 
    const button = document.getElementById(employee.id+'-'+time);
    

    // Toggle button color to employee assigned
    if(button?.getAttribute('style') == null || 
    button?.getAttribute('style') == '')
      button?.setAttribute('style', 'background: ' + employee.color);
    else
      button?.setAttribute('style', '');
      

  }
  
}
