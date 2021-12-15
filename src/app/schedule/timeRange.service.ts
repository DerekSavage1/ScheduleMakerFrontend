import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { TimeRange } from './timeRange';

@Injectable({
  providedIn: 'root'
})
export class TimeRangeService {

  private apiServerUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  public getTimeRange(): Observable<TimeRange[]> {
    return this.http.get<TimeRange[]>(`${this.apiServerUrl}/timeBlock/all`);
  }

  public addTimeRange(timeBlock: TimeRange): Observable<any> {
    return this.http.post<TimeRange>(`${this.apiServerUrl}/timeBlock/add`, timeBlock);
  }

  public updateTimeRange(timeBlockId: number, timeBlock: TimeRange): Observable<any> {
    return this.http.put<TimeRange>(`${this.apiServerUrl}/timeBlock/update/${timeBlockId}`, timeBlock);
  }

  public deleteTimeRange(timeBlockId: number): Observable<any> {
    return this.http.delete<void>(`${this.apiServerUrl}/timeBlock/delete/${timeBlockId}`);
  }
  


}
