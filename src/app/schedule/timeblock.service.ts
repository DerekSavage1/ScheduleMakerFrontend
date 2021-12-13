import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { TimeBlock } from './timeblock';

@Injectable({
  providedIn: 'root'
})
export class TimeBlockService {

  private apiServerUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  public getBlocks(): Observable<TimeBlock[]> {
    return this.http.get<TimeBlock[]>(`${this.apiServerUrl}/timeBlock/all`);
  }

  public addBlock(timeBlock: TimeBlock): Observable<any> {
    return this.http.post<TimeBlock>(`${this.apiServerUrl}/timeBlock/add`, timeBlock);
  }

  public updateBlock(timeBlockId: String, timeBlock: TimeBlock): Observable<any> {
    return this.http.put<TimeBlock>(`${this.apiServerUrl}/timeBlock/update/${timeBlockId}`, timeBlock);
  }

  public deleteBlock(timeBlockId: string): Observable<any> {
    return this.http.delete<void>(`${this.apiServerUrl}/timeBlock/delete/${timeBlockId}`);
  }
  


}
