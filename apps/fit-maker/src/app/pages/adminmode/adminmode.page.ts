import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { take } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgFor, NgIf],
  templateUrl: './adminmode.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent implements OnInit {
  usersList: any = [];
  action: any;

  constructor(private readonly fireBaseStoreService: FireBaseStoreService, protected changeDetector: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.fireBaseStoreService.getCustomCollention('userInfo').subscribe(reponseUserInfo => {
      this.fireBaseStoreService.getCustomCollention('purchasedSubs').pipe(take(1)).subscribe(reponsePurchasedSubs => {
        this.fireBaseStoreService.getCustomCollention('subscriptions').pipe(take(1)).subscribe((reponseSubscriptions: any) => {
          reponseUserInfo.forEach((elementUserInfo: any) => {
            reponsePurchasedSubs.forEach((elementPurchasedSubs: any) => {
              if (elementUserInfo.uid === elementPurchasedSubs.uid) {
                this.usersList.push({
                  uid: elementUserInfo.uid,
                  email: elementUserInfo.email,
                  name: elementUserInfo.name,
                  idsubscription: reponseSubscriptions?.find((element: any) => element.id === elementPurchasedSubs.idsubscription)?.period
                })
              }
              this.changeDetector.detectChanges();
            })
          });
        })
      })
    })
  }

  setOnAction(action: string) {
    if (this.action === action) {
      this.action = undefined;
    } else {
      this.action = action;
    }
  }

  onAction(action: string, item: any) {
    console.log(action, item)
  }
}
