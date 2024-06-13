import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { take } from 'rxjs';
import { NgFor, NgIf } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    NgFor,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './adminmode.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent implements OnInit {
  usersList: any = [];
  action: any;
  subscriptions: any = [];
  selectedUser: any;

  protected readonly userForm = new FormGroup({
    idsubscription: new FormControl('', [Validators.required]),
    uid: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    userType: new FormControl('', [Validators.required]),
    idUser: new FormControl('', [Validators.required]),
    selectedSubscription: new FormControl('', [Validators.required]),
  });
  constructor(
    private readonly fireBaseStoreService: FireBaseStoreService,
    protected changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fireBaseStoreService
      .getCustomCollention('userInfo')
      .subscribe((reponseUserInfo) => {
        this.fireBaseStoreService
          .getCustomCollention('purchasedSubs')
          .pipe(take(1))
          .subscribe((reponsePurchasedSubs) => {
            this.fireBaseStoreService
              .getCustomCollention('subscriptions')
              .pipe(take(1))
              .subscribe((reponseSubscriptions: any) => {
                this.subscriptions = reponseSubscriptions;
                reponseUserInfo.forEach((elementUserInfo: any) => {
                  reponsePurchasedSubs.forEach((elementPurchasedSubs: any) => {
                    if (elementUserInfo.uid === elementPurchasedSubs.uid) {
                      const subscription = reponseSubscriptions?.find(
                        (element: any) =>
                          element.id === elementPurchasedSubs.idsubscription
                      );
                      this.usersList.push({
                        uid: elementUserInfo.uid,
                        idUser: elementUserInfo.id,
                        userType: elementUserInfo.userType,
                        email: elementUserInfo.email,
                        name: elementUserInfo.name,
                        subscription: subscription?.period,
                        idsubscription: subscription?.id,
                        expirationDate: this.calculateExpirationDate(
                          elementPurchasedSubs.createdDate,
                          subscription?.period
                        ),
                      });
                    }
                    this.usersList = this.usersList.reduce(
                      (accumulator: any, current: any) => {
                        if (
                          !accumulator.some(
                            (item: any) => item.uid === current.uid
                          )
                        ) {
                          accumulator.push(current);
                        }
                        return accumulator;
                      },
                      []
                    );
                    this.changeDetector.detectChanges();
                  });
                });
              });
          });
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

  setOnAction(action: string) {
    if (this.action === action) {
      this.action = undefined;
    } else {
      this.action = action;
    }
  }

  onAction(action: string, item: any) {
    console.log(action, item);
    console.log(this.subscriptions);
    this.selectedUser = { ...item };
    this.userForm.patchValue({
      uid: item.uid,
      idsubscription: item.idsubscription,
      name: item.name,
      selectedSubscription: item.idsubscription,
      email: item.email,
      idUser: item.idUser,
      userType: item.userType,
    });
  }
  onSave() {
    console.log(this.userForm.value);
    this.fireBaseStoreService
      .update(
        {
          name: this.userForm.value.name,
          uid: this.userForm.value.uid,
          email: this.userForm.value.email,
          id: this.userForm.value.idUser,
          userType: this.userForm.value.userType,
        },
        'userInfo'
      )
      .subscribe({
        next: () => {
          this.fireBaseStoreService
            .update(
              {
                uid: this.userForm.value.uid,
                id: this.userForm.value.idUser,
                idsubscription: this.userForm.value.selectedSubscription,
                createdDate: new Date(),
              },
              'purchasedSubs'
            )
            .subscribe({
              next: () => {
                location.reload();
              },
            });
        },
      });
  }
}
