import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-adaugareprodus',
  templateUrl: './adaugaproduse.page.html',
})
export class AdaugareProdusPage implements OnInit {
  productForm: FormGroup;

  constructor(
    private firebaseService: FireBaseStoreService,
    private router: Router
  ) {
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      this.firebaseService
        .addCollectionData('products', productData)
        .subscribe(() => {
          this.router.navigate(['/produsenutritive']);
        });
    }
  }
}
