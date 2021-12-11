import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  buttonType: string;
  toggle: boolean;

  constructor() {
    this.buttonType = 'btn-outline-secondary';
    this.toggle = false;
   }

  ngOnInit(): void {
    
  }

  onClickSchedule(): void {
    if(!this.toggle)
      this.buttonType =  'btn-primary';
    else
      this.buttonType = 'btn-outline-secondary';
    this.toggle = !this.toggle;
  }
}
