import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { first, finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-editareproduse',
  templateUrl: './editareproduse.page.html',
})
export class EditareProdusePage implements OnInit {
  productForm: FormGroup;
  productId: string;
  selectedFile: File | null = null;
  currentImageUrl: string | null = null;
  selectedFileUrl: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private firebaseService: FireBaseStoreService,
    private storage: AngularFireStorage,
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
        this.currentImageUrl = product.imageUrl;
      });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFileUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
      this.currentImageUrl = null;
    }
  }

  onSubmit() {
    if (this.productForm.invalid) {
      return;
    }

    const productData = this.productForm.value;

    if (this.selectedFile) {
      const filePath = `products/${
        this.selectedFile.name
      }_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, this.selectedFile);

      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              productData.imageUrl = url;
              this.updateProduct(productData);
            });
          })
        )
        .subscribe();
    } else {
      this.updateProduct(productData);
    }
  }

  private updateProduct(productData: any) {
    this.firebaseService
      .updateDocument('products', this.productId, productData)
      .subscribe(() => {
        this.router.navigate(['/produsenutritive']);
      });
  }
}
