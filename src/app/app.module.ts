import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AlertModule, BsDropdownModule, CollapseModule, ModalModule, TooltipModule } from 'ngx-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './signup/signup.component';


import { AuthInterceptor } from './services/auth.interceptor';
import { AuthService } from './services/auth.service';
import { APIsModule } from './apis/apis.module';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { InViewportModule } from 'ng-in-viewport';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProgressbarModule } from 'ngx-bootstrap';
import { NgxMaskModule } from 'ngx-mask';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { SlickModule } from 'ngx-slick';


import { SendModalComponent } from './send-modal/send-modal.component';
import { AlertService } from './services/alert.service';
import { ReceiveModalComponent } from './receive-modal/receive-modal.component';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { UpperMenuComponent } from './upper-menu/upper-menu.component';
import { ProfileComponent } from './profile/profile.component';
import { ChangePhoneModalComponent } from './change-phone-modal/change-phone-modal.component';
import { GoogleAuthModalComponent } from './google-auth-modal/google-auth-modal.component';
import { TextMaskModule } from 'angular2-text-mask';
import { RegisterAlertComponent } from './register-alert/register-alert.component';
import { CardComponent } from './card/card.component';
import { CardService } from './services/card.service';
import { PushNotificationService } from './services/push-notification.service';
import { ChartComponent } from './chart/chart.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { CardSettingsComponent } from './card-settings/card-settings.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { ExchangeModalComponent } from './exchange-modal/exchange-modal.component';
import { ExchangeResolver } from './exchange/exchange.resolver';
import { BankComponent } from './bank/bank.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { VerificationComponent } from './verification/verification.component';
import { DocsComponent } from './docs/docs.component';
import { WalletChartComponent } from './wallet-chart/wallet-chart.component';
import { BankFormModalComponent } from './bank-form-modal/bank-form-modal.component';
import { BuySellComponent } from './buy-sell/buy-sell.component';
import { BuySellResolver } from './buy-sell/buy-sell.resolver';
import { CurrencyModalComponent } from './currency-modal/currency-modal.component';
import { MainAssetComponent } from './main-asset/main-asset.component';
import { OrderCardComponent } from './order-card/order-card.component';
import { OrderCardResolver } from './order-card/order-card.resolver';
import { CardResolver } from './card/card.resolver';
import { ActivateSigninComponent } from './activate-signin/activate-signin.component';
import { ActivateCardComponent } from './activate-card/activate-card.component';
import { LoanComponent } from './loan/loan.component';
import { WalletComponent } from './wallet/wallet.component';
import { WalletResolver } from './wallet/wallet.resolver';
import { ReportsComponent } from './reports/reports.component';
import { CardStatusComponent } from './card-status/card-status.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};


@NgModule({
  declarations: [
    AppComponent,
    WalletComponent,
    SendModalComponent,
    ReceiveModalComponent,
    UpperMenuComponent,
    ProfileComponent,
    ChangePhoneModalComponent,
    GoogleAuthModalComponent,
    SignupComponent,
    RegisterAlertComponent,
    CardComponent,
    ChartComponent,
    PortfolioComponent,
    CardSettingsComponent,
    ExchangeComponent,
    ExchangeModalComponent,
    VerificationComponent,
    DocsComponent,
    WalletChartComponent,
    BankComponent,
    BankFormModalComponent,
    BuySellComponent,
    CurrencyModalComponent,
    MainAssetComponent,
    OrderCardComponent,
    ActivateSigninComponent,
    ActivateCardComponent,
    LoanComponent,
    ReportsComponent,
    CardStatusComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    APIsModule,
    Ng2TelInputModule,
    InViewportModule,
    ClipboardModule,
    NgxQRCodeModule,
    AlertModule.forRoot(),
    PerfectScrollbarModule,
    ModalModule.forRoot(),
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxMaskModule.forRoot(),
    TextMaskModule,
    TooltipModule.forRoot(),
    NgSelectModule,
    ProgressbarModule.forRoot(),
    NgxMaskModule.forRoot(),
    SweetAlert2Module.forRoot(),
    SlickModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [

    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,

    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    WalletResolver,
    AlertService,
    CardService,
    PushNotificationService,
    ExchangeResolver,
    BuySellResolver,
    OrderCardResolver,
    CardResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
