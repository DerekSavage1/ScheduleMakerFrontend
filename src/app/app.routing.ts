import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeComponent } from './employee/employee.component';
import { ScheduleComponent } from './schedule/schedule.component';

const routes: Routes = [
{ 
    path: 'employee',
    component: EmployeeComponent
},
{
    path: 'dashboard',
    component: DashboardComponent
},
{ 
    path: 'schedule',
    component: ScheduleComponent
},
    // otherwise redirect to home
    { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})

export class AppRoutingModule{

} 

