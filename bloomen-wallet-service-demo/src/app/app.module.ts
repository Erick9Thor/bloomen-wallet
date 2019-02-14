import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ApplicationDataStoreModule } from '@stores/application-data/application-data.module';

import { environment } from '@env/environment';
import { CoreModule } from '@core/core.module';
import { SharedModule } from '@shared/shared.module';
import { HomeModule } from '@pages/home/home.module';
import { ShellModule } from '@shell/shell.module';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Store } from '@ngrx/store';

import * as fromAppActions from '@stores/application-data/application-data.actions';

import * as fromAppSelectors from '@stores/application-data/application-data.selectors';


import { skipWhile, first } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { devToolsConfig } from '@config/devtools.config';

export function onAppInit(store: Store<any>): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise<any>((resolve, reject) => {

      const appInit$ = store.select(fromAppSelectors.getApplicationData).pipe(skipWhile((value) => {
        return !value;
      }), first());
      forkJoin([appInit$]).subscribe(() => {
        resolve();
      });
      store.dispatch(new fromAppActions.InitAppData());
    });
  };
}

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('./ngsw-worker.js', {
      enabled: environment.production
    }),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    CoreModule,
    SharedModule,
    ShellModule,
    HomeModule,
    FlexLayoutModule,
    ApplicationDataStoreModule,
    StoreDevtoolsModule.instrument(devToolsConfig),
    AppRoutingModule // must be imported as the last module as it contains the fallback route
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: onAppInit,
      multi: true,
      deps: [Store]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
