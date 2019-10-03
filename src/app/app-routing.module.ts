import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';



import { ProfileComponent } from './profile/profile.component';
import { SignupComponent } from './signup/signup.component';
import { RegisterAlertComponent } from './register-alert/register-alert.component';
import { CardComponent } from './card/card.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { CardSettingsComponent } from './card-settings/card-settings.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { ExchangeResolver } from './exchange/exchange.resolver';
import { VerificationComponent } from './verification/verification.component';
import { DocsComponent } from './docs/docs.component';
import { WalletChartComponent } from './wallet-chart/wallet-chart.component';
import { BankComponent } from './bank/bank.component';
import { BuySellComponent } from './buy-sell/buy-sell.component';
import { BuySellResolver } from './buy-sell/buy-sell.resolver';
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

export const routes: Routes = [
    {path: '', redirectTo: '/portfolio', pathMatch: 'full'},
    {path: 'activate', component: ActivateSigninComponent},
    {path: 'activate/card', component: ActivateCardComponent},
    {path: 'activate/card/:step', component: ActivateCardComponent},
    { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService]},
    { path: 'verification', component: VerificationComponent },
    { path: 'portfolio' , component: PortfolioComponent, canActivate: [AuthGuardService] },
    { path: 'signup', component: SignupComponent },
    { path: 'signin', component: SignupComponent },
    { path: 'mydocs', component: DocsComponent },
    {path: 'loan', component: LoanComponent},
    {path: 'reports', component: ReportsComponent},
    {
      path: 'buy-sell',
      component: BuySellComponent,
      resolve: { defaults: BuySellResolver },
      canActivate: [AuthGuardService]
    },
    {
      path: 'exchange',
      component: ExchangeComponent,
      resolve: { defaults: ExchangeResolver },
      canActivate: [AuthGuardService]
    },
    { path: 'alert' , component: RegisterAlertComponent },
    { path: 'card',
      children:
      [
        { path: '', component: CardComponent, resolve: { defaults: CardResolver } },
        { path: 'settings', component: CardSettingsComponent },
        { path: 'order', component: OrderCardComponent, resolve: { defaults: OrderCardResolver } },
        {path: 'status', component: CardStatusComponent}
      ],
      canActivate: [AuthGuardService]
  },
  {
    path: 'wallet',
    component: WalletComponent,
    resolve:
    {
      defaults: WalletResolver
    },
    canActivate: [AuthGuardService]
  },
  { path: 'banking', component: BankComponent },
  {
    path: 'main-asset',
    component: MainAssetComponent,
    resolve:
    {
      defaults: WalletResolver
    },
    canActivate: [AuthGuardService]
  }
]
  ;

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
