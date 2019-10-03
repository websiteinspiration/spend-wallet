import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { CardService } from '../services/card.service';
import { UtilService } from '../services/util.service';

@Injectable()
export class OrderCardResolver implements Resolve<Event> {

  constructor(
    private cardService: CardService,
    private utilService: UtilService
  ) {
  }


  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Event> | Promise<Event> | Event | any {
    this.utilService.showLoading.next(true);
    return forkJoin(
      this.cardService.cards()
    ).toPromise()
      .then(x => {
        this.utilService.showLoading.next(false);
        if (x[0]['success']) {
          return {
            cards: x[0]['data']
          };
        } else {
          return  {
            cards: undefined
          };
        }
      }).catch(err => {
        this.utilService.showLoading.next(false);
      });
  }

}
