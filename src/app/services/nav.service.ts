import { Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavService {
  headlineObservable = new BehaviorSubject<string>("Dancing Moves");
  constructor(private router: Router) { }

  navigate(route: string[] = [], queryParams: Params | undefined = undefined): Promise<boolean> {
    if (queryParams) {
      return this.router.navigate(route, { queryParams: queryParams, queryParamsHandling: 'merge' });
    }
    return this.router.navigate(route, { queryParamsHandling: 'merge' });
  }

}
