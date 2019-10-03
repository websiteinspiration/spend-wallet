import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ChartComponent } from './chart.component';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select period', fakeAsync(() => {
    component.selectPeriod('24', 0);
    component.changeFilter.subscribe(res => {
      expect(res).toBe('24');
    });
  }));

  it('should get data', fakeAsync(() => {
    component.data = {
      price: [
        {
          amount: 10,
          amountFormatted: 10.00,
          date: '2016-10-10'
        }
      ],
      marketCap: [
        {
          amount: 10,
          amountFormatted: 10.00,
          date: '2016-10-10'
        }
      ],
      volume: [
        {
          amount: 10,
          amountFormatted: 10.00,
          date: '2016-10-10'
        }
      ]
    };
    component.symbol = {
      marketData: {}
    };
    component.getData();
    tick(1000);
    expect(component.data.price[0].volumeFormatted).toBe(10.00);
  }));

  it('should show detail data', fakeAsync(() => {
    component.symbol = {
      marketData: {
        totalSupplyFormatted: '1'
      },
      symbol: 'BTC'
    };
    component.showDetailData({
      marketCapFormatted: '11',
      volumeFormatted: '1'
    });
  }));

  it('should init svg', fakeAsync(() => {
    expect(component.svg).toBeNull();
    component.initSvg();
    expect(component.svg).toBeDefined();
  }));

  it('should get formatted time', fakeAsync(() => {
    const date = '2018-11-16T07:59:49.821Z';
    expect(component.getFormattedTime(date)).toBe('23:59');
  }));

  it('should scroll', fakeAsync(() => {
    component.onScroll({
      srcElement: {
        scrollLeft: 1000
      }
    });
    expect(component.scrollLeft).toBe(1000);
  }));
});
