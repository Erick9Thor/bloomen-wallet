import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/index';
import { MaterialModule } from '@app/material.module';
import { BloomenCardsComponent } from './bloomen-cards.component';

describe('HomeComponent', () => {
  let component: BloomenCardsComponent;
  let fixture: ComponentFixture<BloomenCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FlexLayoutModule,
        MaterialModule,
        CoreModule,
        SharedModule,
        HttpClientTestingModule
      ],
      declarations: [BloomenCardsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BloomenCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
