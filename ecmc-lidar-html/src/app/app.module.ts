import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppMaterial } from './app.material';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ConfigComponent } from './components/config/config.component';
import { LoginComponent } from './components/login/login.component'; 
import { MainNavComponent } from './components/main-nav/main-nav.component';

import { LoginService } from './services/login.service';
import { TokenInterceptorService } from './services/token-interceptor.service';

import { AuthGuard } from './guard/auth.guard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CameraComponent } from './components/home/camera/camera.component';
import { ScanComponent } from './components/home/scan/scan.component';
import { HistoricConfigComponent } from './components/config/historic-config/historic-config.component';
import { SystemConfigComponent } from './components/config/system-config/system-config/system-config.component';
import { UserConfigComponent } from './components/config/user-config/user-config/user-config.component';
import { HighchartsChartModule } from 'highcharts-angular';

import { registerLocaleData } from '@angular/common';
import localeEsCL from '@angular/common/locales/es-CL';
import { LoadTypeConfigComponent } from './components/config/load-type-config/load-type-config.component';
import { CustomerConfigComponent } from './components/config/customer-config/customer-config.component';
import { GalleryComponent } from './components/config/historic-config/gallery/gallery.component';
import { DiceTenerConfigComponent } from './components/config/dice-tener-config/dice-tener-config.component';
import { ShipperComponent } from './components/shipper/shipper.component';
import { TravelConfigComponent } from './components/config/travel-config/travel-config.component';

registerLocaleData(localeEsCL, 'es-Cl');

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ConfigComponent,
    LoginComponent,
    ScanComponent,
    MainNavComponent,
    CameraComponent,
    HistoricConfigComponent,
    SystemConfigComponent,
    UserConfigComponent,
    LoadTypeConfigComponent,
    CustomerConfigComponent,
    GalleryComponent,
    DiceTenerConfigComponent,
    ShipperComponent,
    TravelConfigComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    AppMaterial,
    BrowserAnimationsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    HighchartsChartModule
  ], 
  providers: [LoginService, AuthGuard, HistoricConfigComponent,Title,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {provide: LOCALE_ID, useValue: 'es-Cl'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
