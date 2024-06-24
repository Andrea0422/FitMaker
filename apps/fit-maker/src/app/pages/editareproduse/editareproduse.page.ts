import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { first } from 'rxjs';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-editareproduse',
  templateUrl: './editareproduse.page.html',
})
export class EditareProdusePage implements OnInit {
  productForm: FormGroup;
  productId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private firebaseService: FireBaseStoreService,
    private router: Router
  ) {
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    });
    this.productId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.loadProductData();
  }

  loadProductData() {
    this.firebaseService
      .getDocumentById('products', this.productId)
      .pipe(first())
      .subscribe((product: any) => {
        this.productForm.patchValue({
          name: product.name,
          price: product.price,
          description: product.description,
        });
      });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      this.firebaseService
        .updateDocument('products', this.productId, productData)
        .subscribe(() => {
          this.router.navigate(['/produsenutritive']);
        });
    }
  }
}
