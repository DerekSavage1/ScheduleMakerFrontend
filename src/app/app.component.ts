import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Employee } from './employee';
import { EmployeeService } from './employee.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  title = 'chickenNoodleOnline';

  public employees: Employee[] = [];
  
  constructor(private employeeService: EmployeeService){}

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

  public onOpenModal(employee: Employee, mode: string): void {
    const button = document.createElement('button');
    button.type = 'modal';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');
    if (mode === 'add') {
      button.setAttribute('data-target', 'addEmployeeModal');
    }
    if (mode === 'edit') {
      button.setAttribute('data-target', 'editEmployeeModal');
    }
    if (mode === 'delete') {
      button.setAttribute('data-target', 'deleteEmployeeModal');
    }
  }


}
