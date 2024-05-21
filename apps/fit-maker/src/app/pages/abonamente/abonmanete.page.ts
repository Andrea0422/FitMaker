import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { NgFor, NgIf } from '@angular/common';
import { first } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-abonament-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgFor, NgIf],
  templateUrl: './abonamente.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbonamentePage implements OnInit {
  subscriptionList: any[] = [];
  isAlreadyPurchased = false;
  protected readonly fireBaseStoreService = inject(FireBaseStoreService);
  protected readonly changeDetector = inject(ChangeDetectorRef);
  protected readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.fireBaseStoreService
      .getCollention('subscriptions')
      .pipe(first())
      .subscribe((response) => {
        this.onCheckPurchases(response);
        this.changeDetector.detectChanges();
      });
  }

  onCheckPurchases(subscriptions: any) {
    this.fireBaseStoreService
      .getCollention('purchasedSubs')
      .pipe(first())
      .subscribe((response) => {
        console.log(response);
        const purchasedItem = response?.find(
          (element: any) =>
            element.uid === this.authService.getCurrentUser()?.uid
        );
        console.log(purchasedItem);
        if (purchasedItem) {
          this.isAlreadyPurchased = true;
        } else {
          this.isAlreadyPurchased = false;
          this.subscriptionList = subscriptions.sort(
            (a: any, b: any) => +a.price - +b.price
          );
        }
        this.changeDetector.detectChanges();
      });
  }
}
