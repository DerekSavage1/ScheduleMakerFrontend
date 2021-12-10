import { Routes, RouterModule } from '@angular/router';
import { EmployeeComponent } from './employee/employee.component';


const routes: Routes = [
    { path: 'employee', component: EmployeeComponent },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);