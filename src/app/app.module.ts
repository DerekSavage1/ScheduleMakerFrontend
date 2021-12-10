import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { EmployeeComponent } from './employee/employee.component';
import { appRoutingModule } from './app.routing';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    EmployeeComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    appRoutingModule
  ],
  providers: [],
  bootstrap: [
    AppComponent,
    EmployeeComponent
  ]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fab, fas);
  }

}
