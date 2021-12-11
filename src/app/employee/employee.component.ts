import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { Employee } from '../employee';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})

export class EmployeeComponent implements OnInit{
  faCoffee = faCoffee;
  title = 'chickenNoodleOnline';

  public deleteEmployee: Employee | undefined;
  public updateEmployee: Employee | undefined;


  public employees: Employee[] | undefined;
  
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

  public onAddEmployee(addForm: NgForm): void {
    document.getElementById('addFormClose')?.click();
    this.employeeService.addEmployees(addForm.value).subscribe(
      (responce: Employee) => {
        console.log(responce);
        this.getEmployees();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
    
  }

  public onUpdateEmployee(employeeId: String, employee: Employee): void {
    this.employeeService.updateEmployees(employeeId, employee).subscribe(
      (responce: Employee) => {
        console.log(responce);
        this.getEmployees();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
    
  }

  public onDeleteEmployee(employee: Employee): void {
    this.employeeService.deleteEmployees(employee.id).subscribe(
      (responce: HttpStatusCode) => {
        console.log(responce);
        this.getEmployees();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
    
  }

  public onOpenModal(employee: Employee, mode: string): void {
    const container = document.getElementById('main-container');
    const button = document.createElement('button');
    button.style.display = 'none';
    button.setAttribute('data-bs-toggle', 'modal');
    if (mode === 'add') {
      button.setAttribute('data-bs-target', '#addModal');
    }
    if (mode === 'edit') {
      this.updateEmployee = employee;
      button.setAttribute('data-bs-target', '#editModal');
    }
    if (mode === 'delete') {
      this.deleteEmployee = employee;
      button.setAttribute('data-bs-target', '#deleteModal');
    }

    container?.appendChild(button);
    button.click();
  }
}

