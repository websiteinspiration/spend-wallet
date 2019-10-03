import {API} from './baseAPI';
import {Observable, Subject} from 'rxjs';
import {environment} from '../../environments/environment';

class MockAPI extends API {

  private change = new Subject<number>();
  change$ = this.change.asObservable();

  public data = 10;


  onTimeInterval() {
    this.data = 20;
    this.change.next(this.data);
    return Observable.create(false);
  }

}

describe('baseAPI', () => {

  it('should fire only if the data changed', (done) => {
      const api = new MockAPI(null);
      environment.interval = 2000;
      const initData = api.data;
      api.startInterval();
      api.change$.subscribe((e) => {

        expect(initData).toBe(10);
        expect(e).toBe(20);

        return done();
      });
    }
  );


});
