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
    cnp: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{13}$'),
    ]),
  });

  isLoading = false;
  latestProductId: number = 1;

  ngOnInit(): void {
    console.log('Route ID:', this.activatedRoute.snapshot.params['id']);
    this.getLatestProductId();
  }

  getLatestProductId() {
    this.firebaseStoreService
      .getCollention('purchasedProducts')
      .subscribe((products: any[]) => {
        if (products.length > 0) {
          const validIds = products
            .map((product) => product.id)
            .filter((id) => typeof id === 'number' && !isNaN(id));
          this.latestProductId =
            validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
        } else {
          this.latestProductId = 1;
        }
      });
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
        id: this.latestProductId,
        createdDate: new Date(),
      };

      this.isLoading = true;

      this.saveProduct(purchasedProduct);
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
          this.getLatestProductId();
        },
        error: (error) => {
          console.error('Error purchasing product: ', error);
          this.isLoading = false;
          this.changeDetector.detectChanges();
        },
      });
  }
}
