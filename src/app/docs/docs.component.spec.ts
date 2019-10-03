import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { DocsComponent } from './docs.component';
import { Component, Input } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { UtilService } from '../services/util.service';
import { of } from 'rxjs';

describe('DocsComponent', () => {
  let component: DocsComponent;
  let fixture: ComponentFixture<DocsComponent>;
  let mockUtilService;

  beforeEach(async(() => {
    mockUtilService = jasmine.createSpyObj(['getApiVersions']);
    TestBed.configureTestingModule({
      declarations: [
        DocsComponent,
        MockUpperMenuComponent
      ],
      imports: [
        HttpClientModule
      ],
      providers: [
        {provide: UtilService, useValue: mockUtilService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load docs', fakeAsync(() => {
    mockUtilService.getApiVersions.and.returnValue(of({
      success: true,
      data: {
        links: []
      }
    }));
    component.loadDocs();
    tick(1000);
    expect(component.links.length).toBe(0);
  }));

  it('should load background', () => {
    component.loadBackground();
    expect(component.bodyEl.background).toBe('/assets/images/card-setting-background.png');
  });

  @Component({selector: 'app-upper-menu', template: ''})
  class MockUpperMenuComponent {
    @Input() public toggle: any;
  }
});
