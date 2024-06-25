import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { first } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-contulmeu',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './contulmeu.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContulMeuPage implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly firebaseStoreService = inject(FireBaseStoreService);
  protected readonly changeDetector = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  mySub: any;
  idsubscription: any;
  isLoading = false;
  duration: string | undefined;

  ngOnInit(): void {
    this.firebaseStoreService
      .getCollention('purchasedSubs')
      .pipe(first())
      .subscribe((response) => {
        const purchasedSub = response?.find(
          (element: any) =>
            element.uid === this.authService.getCurrentUser()?.uid
        );
        this.idsubscription = purchasedSub?.id;
        this.getSubs(purchasedSub);
      });
  }

  getSubs(purchasedSub: any) {
    this.firebaseStoreService
      .getCollention('subscriptions')
      .pipe(first())
      .subscribe((response) => {
        const subscription = response.find(
          (element: any) => element.id === purchasedSub?.idsubscription
        );
        if (subscription) {
          console.log('subscription:', subscription);
          this.mySub = {
            ...subscription,
            createdDate: purchasedSub.createdDate,
            period: subscription.period,
            price: subscription.price,
            expirationDate: this.calculateExpirationDate(
              purchasedSub.createdDate,
              subscription.period
            ),
          };
        }
        this.changeDetector.detectChanges();
      });
  }
  calculateExpirationDate(createdDate: any, period: string): string {
    console.log('createdDate:', createdDate);
    console.log('period:', period);

    period = period.trim();

    let startDate: Date;

    if (typeof createdDate === 'object' && createdDate.seconds) {
      startDate = new Date(createdDate.seconds * 1000);
    } else if (typeof createdDate === 'number') {
      startDate = new Date(createdDate);
    } else {
      startDate = new Date(createdDate);
    }

    console.log('startDate:', startDate);

    if (isNaN(startDate.getTime())) {
      return 'Data invalidă';
    }

    let endDate = new Date(startDate);

    switch (period) {
      case '1zi':
      case '1 zi':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case '1luna':
      case '1 luna':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case '3luni':
      case '3 luni':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case '1an':
      case '1 an':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        console.log('Perioada necunoscută:', period);
        return 'Perioada necunoscută';
    }

    console.log('endDate:', endDate);

    const startDateString = startDate.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const endDateString = endDate.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `${startDateString} - ${endDateString}`;
  }

  onDelete() {
    if (this.mySub) {
      this.isLoading = true;
      this.firebaseStoreService
        .delete(this.idsubscription, 'purchasedSubs')
        .subscribe({
          next: () => {
            this.mySub = undefined;
            this.isLoading = false;
            this.changeDetector.detectChanges();
          },
        });
    }
  }

  onDeleteAccount() {
    this.firebaseStoreService
      .delete(this.idsubscription, 'purchasedSubs')
      .subscribe({
        next: () => {
          this.firebaseStoreService
            .getCustomCollention('userInfo', {
              firstField: 'uid',
              condition: '==',
              secondField: this.authService.getCurrentUser()?.uid,
            })
            .pipe(first())
            .subscribe({
              next: (user: any) => {
                this.firebaseStoreService
                  .delete(user[0].id, 'userInfo')
                  .subscribe({
                    next: () => {
                      this.authService.deleteUser().subscribe({
                        next: () => {
                          this.router.navigate(['/login']);
                        },
                      });
                    },
                  });
              },
            });
        },
      });
  }

  onPrint() {
    window.print();
  }
  calculateVAT(price: number): number {
    const VAT_RATE = 0.19;
    return price * VAT_RATE;
  }
}
