// Basic
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Dapp } from '@core/models/dapp.model.js';


import { Store } from '@ngrx/store';
import * as fromDappSelectors from '@stores/dapp/dapp.selectors';
import * as fromMnemonicSelectors from '@stores/mnemonic/mnemonic.selectors';
import * as fromMnemonicActions from '@stores/mnemonic/mnemonic.actions';

import * as fromDevicesActions from '@stores/devices/devices.actions';
import * as fromPurchasesActions from '@stores/purchases/purchases.actions';

import { Subscription } from 'rxjs';
import { Logger } from '@services/logger/logger.service';
import { MnemonicModel } from '@core/models/mnemonic.model';



const log = new Logger('dapp-sections.component');

/**
 * Dapp-sections page
 */
@Component({
  selector: 'blo-dapp-sections',
  templateUrl: './dapp-sections.component.html',
  styleUrls: ['./dapp-sections.component.scss']
})
export class DappSectionsComponent implements OnInit, OnDestroy {

  public dapp: Dapp;

  public mnemonic: MnemonicModel;

  private mnemonics$: Subscription;

  public dapps$: Subscription;

  public currentTabIndex: string;

  constructor(
    private store: Store<any>,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  public ngOnInit() {
    const address = this.activatedRoute.snapshot.paramMap.get('address');

    this.currentTabIndex = this.activatedRoute.snapshot.queryParamMap.get('tabIndex') || '0';
    this.onTabClick({ index: parseInt(this.currentTabIndex, 10) }, false);

    this.dapps$ = this.store.select(fromDappSelectors.selectAllDapp).subscribe((dapps) => {
      this.dapp = dapps.find(dapp => dapp.address === address);
    });

    this.mnemonics$ = this.store.select(fromMnemonicSelectors.selectAllMnemonics).subscribe((mnemonics) => {
      this.mnemonic = mnemonics.find(mnemonicItem => mnemonicItem.address === address);
      if (this.mnemonic) {
        this.store.dispatch(new fromMnemonicActions.ChangeWallet({ randomSeed: this.mnemonic.randomSeed }));
      }
    });
  }

  public ngOnDestroy() {
    this.mnemonics$.unsubscribe();
    this.dapps$.unsubscribe();
  }

  public onTabClick(event: any, refreshData = true) {
    this.router.navigate([], {
      queryParams: {
        tabIndex: event.index
      },
      queryParamsHandling: 'merge'
    });
    if (refreshData) {
      this.updateShoppingListData(event.index);
    }
  }

  private updateShoppingListData(index) {
    if (index === 3) {
      // Refresh data required to ensure that Purchase/Allow action did actually update the blockchain
      // Because of reverse ordering refresh all data to load first/last page ignoring other previous loaded pages
      this.store.dispatch(new fromDevicesActions.InitDevices());
      this.store.dispatch(new fromPurchasesActions.InitPurchases());
    }
  }
}
