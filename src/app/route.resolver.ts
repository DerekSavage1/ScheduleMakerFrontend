import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { catchError, of } from "rxjs";
import { EmployeeService } from "./employee.service";

@Injectable()
export class RouteResolver implements Resolve<any> {
    
    constructor(private employeeService: EmployeeService) {
        //Declare an API data service
    }
    resolve() {
        console.log('Route Resolve');
        return this.employeeService.getEmployees().pipe(
            catchError(err => {
                return of(null);
            })
        );
    }
}