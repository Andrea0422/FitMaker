import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { AuthService } from '../../core/services/auth.service';
import { first } from 'rxjs';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-cumparare-produse-page',
  templateUrl: './cumparareproduse.page.html',
})
export class CumparareProduse implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private firebaseStoreService: FireBaseStoreService,
    private authService: AuthService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  productsForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]+$'),
    ]),
    card: new FormControl('', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    cvv: new FormControl('', [Validators.required]),
  });

  isLoading = false;

  ngOnInit(): void {
    console.log('Route ID:', this.activatedRoute.snapshot.params['id']);
  }

  onSubmit() {
    if (this.productsForm.valid) {
      const formData = this.productsForm.value;
      const idProduct = this.activatedRoute.snapshot.params['id'];
      const currentUser = this.authService.getCurrentUser();
      if (!idProduct || !currentUser) {
        console.error('Product ID or User is missing.');
        return;
      }

      const { card, date, cvv, ...purchaseData } = formData;

      const purchasedProduct = {
        ...purchaseData,
        uid: currentUser.uid,
        idproduct: idProduct,
        createdDate: new Date(),
      };

      this.isLoading = true;
      this.firebaseStoreService
        .getCollention('purchasedProducts')
        .pipe(first())
        .subscribe((response: any[]) => {
          console.log('Firebase Response:', response);
          const existingProduct = response?.find(
            (element) =>
              element.uid === currentUser.uid && element.idproduct === idProduct
          );

          if (!existingProduct) {
            this.saveProduct(purchasedProduct);
          } else {
            this.firebaseStoreService
              .delete(existingProduct.id, 'purchasedProducts')
              .subscribe({
                next: () => {
                  this.saveProduct(purchasedProduct);
                },
                error: (error) => {
                  console.error('Error deleting existing product:', error);
                  this.isLoading = false;
                },
              });
          }
        });
    } else {
      alert('Te rugăm să completezi toate câmpurile.');
    }
  }

  saveProduct(purchasedProduct: any) {
    this.firebaseStoreService
      .addCollectionData('purchasedProducts', purchasedProduct)
      .subscribe({
        next: () => {
          console.log('Product purchased successfully', purchasedProduct);
          this.productsForm.reset();
          this.isLoading = false;
          this.router.navigate(['/produsachizitionat']);
          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Error purchasing product: ', error);
          this.isLoading = false;
          this.changeDetector.detectChanges();
        },
      });
  }
}
