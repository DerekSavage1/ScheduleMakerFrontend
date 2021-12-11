import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeComponent } from './employee/employee.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { StockComponent } from './stock/stock.component';

const routes: Routes = [
    { path: 'employee', component: EmployeeComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'stock', component: StockComponent },
    { path: 'schedule', component: ScheduleComponent },


    // otherwise redirect to home
    { path: '**', redirectTo: 'dashboard' }
];

export const appRoutingModule = RouterModule.forRoot(routes, {useHash: true});