import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {TransactionService} from './transaction.service';
import {SymbolService} from './symbol.service';
import {WalletService} from './wallet.service';
import {UserService} from './user.service';
import { ExchangeService } from './exchange.service';
import { BankService } from './bank.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    WalletService,
    TransactionService,
    SymbolService,
    UserService,
    ExchangeService,
    BankService
  ],
  declarations: []
})
export class APIsModule {
}
