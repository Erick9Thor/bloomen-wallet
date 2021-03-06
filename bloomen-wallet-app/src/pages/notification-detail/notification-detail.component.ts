import { Component, OnInit, OnDestroy } from '@angular/core';
import { Logger } from '@services/logger/logger.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Dapp } from '@core/models/dapp.model';
import { AssetsContract } from '@core/core.module';
import { MatSnackBar, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Web3Service } from '@services/web3/web3.service';

import * as fromDappSelectors from '@stores/dapp/dapp.selectors';
import * as fromMnemonicSelectors from '@stores/mnemonic/mnemonic.selectors';
import * as fromMnemonicActions from '@stores/mnemonic/mnemonic.actions';
import * as fromBalanceSelectors from '@stores/balance/balance.selectors';
import * as fromPurchasesSelectors from '@stores/purchases/purchases.selectors';
import { map } from 'rxjs/operators';
import { DappGeneralDialogComponent } from '@components/dapp-general-dialog/dapp-general-dialog.component';

const log = new Logger('notification-detail.component');

@Component({
  selector: 'blo-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss']
})
export class NotificationDetailComponent implements OnInit, OnDestroy {

  public notification: Dapp.News;
  public dapp: Dapp;
  public assetId: string;
  public address: string;
  public outOfCash: boolean;
  public alreadyBought: boolean;
  public balance$: Subscription;
  public dapps$: Subscription;
  public mnemonics$: Subscription;
  public purchases$: Subscription;
  public notificationId: number;

  constructor(
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private assets: AssetsContract,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private web3Service: Web3Service,
    private dialog: MatDialog
  ) { }

  public ngOnInit() {
    const address = this.activatedRoute.snapshot.paramMap.get('address');
    this.assetId = this.activatedRoute.snapshot.paramMap.get('assetId');

    this.dapps$ = this.store.select(fromDappSelectors.selectAllDapp).subscribe((dapps) => {
      this.dapp = dapps.find(dapp => dapp.address === address);
      if (this.dapp) {
        this.notificationId = this.dapp.news.findIndex(news => news.payment.asset === this.assetId);
        this.notification = this.dapp.news[this.notificationId];
      }
    });

    this.purchases$ = this.store.select(fromPurchasesSelectors.selectAllPurchases).subscribe((purchases) => {
      this.alreadyBought = !!purchases.find(purchase => purchase.assetId === this.assetId);
    });

    this.balance$ = this.store.select(fromBalanceSelectors.getBalance).subscribe((balance) => {
      this.outOfCash = !parseInt(balance, 10);
    });

    this.mnemonics$ = this.store.select(fromMnemonicSelectors.selectAllMnemonics).subscribe((mnemonics) => {
      const mnemonic = mnemonics.find(mnemonicItem => mnemonicItem.address === address);
      if (mnemonic) {
        this.store.dispatch(new fromMnemonicActions.ChangeWallet({ randomSeed: mnemonic.randomSeed }));
      }
    });
  }

  public dialogBuyContent() {
    const buyContent: Dapp.News.Payment = this.notification.payment;
    const buyObject = {
      assetId: parseInt(buyContent.asset, 10),
      schemaId: parseInt(buyContent.schema, 10),
      amount: parseInt(buyContent.price, 10),
      dappId: this.dapp.dappId,
      description: this.translate.instant(`${this.dapp.address}.news.${this.notificationId}.title`) || 'no description'
    };

    const dialogRef = this.dialog.open(DappGeneralDialogComponent, {
      width: '250px',
      height: '200px',
      data: {
        title: this.translate.instant('dapp.notifications.dialog_buy.title'),
        description: this.translate.instant('dapp.notifications.dialog_buy.description', {
          id: buyObject.assetId,
          title: buyObject.description,
          price: buyContent.price
        }),
        buttonAccept: this.translate.instant('common.accept'),
        buttonCancel: this.translate.instant('common.cancel')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._buyContent(buyObject);
      }
    });
  }

  private _buyContent(buyObject) {
    this.web3Service.ready(() => {
      this.assets.buy(buyObject.assetId, buyObject.schemaId, buyObject.amount, buyObject.dappId, buyObject.description).then((result: any) => {
        log.debug('OK', result);
        this.snackBar.open(this.translate.instant('common.transaction_success'), null, {
          duration: 2000,
        });
      }, (error: any) => {
        log.debug('KO', error);
        this.snackBar.open(this.translate.instant('common.transaction_error'), null, {
          duration: 2000,
        });
      });
    });
  }

  public ngOnDestroy() {
    this.dapps$.unsubscribe();
    this.balance$.unsubscribe();
    this.mnemonics$.unsubscribe();
    this.purchases$.unsubscribe();
  }



}
