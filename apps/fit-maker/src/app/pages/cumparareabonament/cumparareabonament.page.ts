import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { AuthService } from '../../core/services/auth.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-cumparare-abonament-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ReactiveFormsModule],
  templateUrl: './cumparareabonament.page.html',
})
export class CumparareAbonament implements OnInit {
  protected readonly activatedRoute = inject(ActivatedRoute);
  private readonly firebaseStoreService = inject(FireBaseStoreService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly changeDetector = inject(ChangeDetectorRef);

  protected readonly subsForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    card: new FormControl('', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    cvv: new FormControl('', [Validators.required]),
  });

  isLoading = false;

  ngOnInit(): void {
    console.log(this.activatedRoute.snapshot.params['id']);
  }

  onSubmit() {
    if (this.subsForm.valid) {
      this.firebaseStoreService
        .getCollention('purchasedSubs')
        .pipe(first())
        .subscribe((response) => {
          console.log(response);
          const purchasedSub = response?.find(
            (element: any) =>
              element.uid === this.authService.getCurrentUser()?.uid
          );

          if (!purchasedSub) {
            this.purchaseSubs();
          } else {
            this.firebaseStoreService
              .delete(purchasedSub.id, 'purchasedSubs')
              .subscribe({
                next: () => {
                  this.purchaseSubs();
                },
              });
          }
        });
    }
  }
  purchaseSubs() {
    this.isLoading = true;
    const subscription = {
      uid: this.authService.getCurrentUser()?.uid,
      idsubscription: this.activatedRoute.snapshot.params['id'],
      createdDate: new Date(),
    };
    this.firebaseStoreService
      .addCollectionData('purchasedSubs', subscription)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/abonamentachizitionat']);
          this.changeDetector.detectChanges();
        },
      });
  }
}
