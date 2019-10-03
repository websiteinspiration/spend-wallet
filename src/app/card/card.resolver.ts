import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';
import { CardService } from '../services/card.service';
import { UtilService } from '../services/util.service';

@Injectable()
export class CardResolver implements Resolve<Event> {

  constructor(
    private cardService: CardService,
    private utilService: UtilService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Event> | Promise<Event> | Event | any {
    this.utilService.showLoading.next(true);
    return forkJoin(
      this.cardService.getCards(),
    ).toPromise()
      .then(x => {
        this.utilService.showLoading.next(false);
        return {
          cards: x[0],
        };
      }).catch(err => {
        this.utilService.showLoading.next(false);
      });
  }

}
