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

  ngOnInit(): void {
    this.firebaseStoreService
      .getCollention('purchasedSubs')
      .pipe(first())
      .subscribe((response) => {
        console.log(response);
        const purchasedSub = response?.find(
          (element: any) =>
            element.uid === this.authService.getCurrentUser()?.uid
        );
        this.idsubscription = purchasedSub?.id;
        this.getSubs(purchasedSub?.idsubscription);
      });
  }

  getSubs(idsubscription: any) {
    this.firebaseStoreService
      .getCollention('subscriptions')
      .pipe(first())
      .subscribe((response) => {
        this.mySub = response.find(
          (element: any) => element.id === idsubscription
        );
        this.changeDetector.detectChanges();
      });
  }
  onDelete() {
    if (this.mySub) {
      this.firebaseStoreService
        .delete(this.idsubscription, 'purchasedSubs')
        .subscribe({
          next: () => {
            this.mySub = undefined;
          },
        });
    }
  }
  onDeleteAccount() {
    this.firebaseStoreService
      .delete(this.idsubscription, 'purchasedSubs')
      .subscribe({
        next: () => {
          console.log('1');
          this.firebaseStoreService
            .getCustomCollention('userInfo', {
              firstField: 'uid',
              condition: '==',
              secondField: this.authService.getCurrentUser()?.uid,
            })
            .pipe(first())
            .subscribe({
              next: (user: any) => {
                console.log(user);
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
}
