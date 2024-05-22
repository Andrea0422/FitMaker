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
import { UserType } from '../../core/enums/user-type.enum';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgFor, NgIf, ReactiveFormsModule],
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
                      this.usersList.push({
                        uid: elementUserInfo.uid,
                        idUser: elementUserInfo.id,
                        userType: elementUserInfo.userType,
                        email: elementUserInfo.email,
                        name: elementUserInfo.name,
                        subscription: reponseSubscriptions?.find(
                          (element: any) =>
                            element.id === elementPurchasedSubs.idsubscription
                        )?.period,
                        idsubscription: reponseSubscriptions?.find(
                          (element: any) =>
                            element.id === elementPurchasedSubs.idsubscription
                        )?.id,
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
