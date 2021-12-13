import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeComponent } from './employee/employee.component';
import { RouteResolver } from './route.resolver';
import { ScheduleComponent } from './schedule/schedule.component';
import { StockComponent } from './stock/stock.component';

const routes: Routes = [
{ 
    path: 'employee',
    component: EmployeeComponent,
    resolve: {
        data: RouteResolver
    }
},
{
    path: 'dashboard',
    component: DashboardComponent
},
{
    path: 'stock',
    component: StockComponent
},
{ 
    path: 'schedule',
    component: ScheduleComponent,
    resolve: {
        data: RouteResolver
    }
},
    // otherwise redirect to home
    { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule],
    providers: [RouteResolver]
})

export class AppRoutingModule{

} 

