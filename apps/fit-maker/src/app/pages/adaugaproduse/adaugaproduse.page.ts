import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  selector: 'app-adaugareprodus',
  templateUrl: './adaugaproduse.page.html',
})
export class AdaugareProdusPage implements OnInit {
  productForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private firebaseService: FireBaseStoreService,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.productForm = new FormGroup({
      name: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (this.productForm.invalid || !this.selectedFile) {
      return;
    }

    const productData = this.productForm.value;
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
            const productWithImage = { ...productData, imageUrl: url };
            this.firebaseService
              .addCollectionData('products', productWithImage)
              .subscribe(() => {
                this.router.navigate(['/produsenutritive']);
              });
          });
        })
      )
      .subscribe();
  }
}
