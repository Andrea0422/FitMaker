import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  selector: 'app-produsenutritive',
  templateUrl: './produsenutritive.page.html',
})
export class ProduseNutritivePage implements OnInit {
  products$: Observable<any[]> | undefined;
  allProducts: any[] = [];
  filteredProducts: any[] = [];
  searchQuery: string = '';

  constructor(
    private firebaseService: FireBaseStoreService,
    protected authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadProducts();
  }

  loadProducts(): void {
    console.log('loadProducts called');
    this.products$ = this.firebaseService.getCollention('products');
    this.products$.subscribe(
      (products) => {
        console.log('Products loaded from FirebaseStoreService:', products);
        this.allProducts = products;
        this.filterProducts();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }

  filterProducts(): void {
    console.log('filterProducts called with searchQuery:', this.searchQuery);
    if (!this.searchQuery) {
      this.filteredProducts = this.allProducts;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredProducts = this.allProducts.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
    }
    console.log('Filtered products:', this.filteredProducts);
    this.cdr.detectChanges();
  }

  deleteProduct(productId: string) {
    if (confirm('Ești sigur că vrei să ștergi acest produs?')) {
      const productToDelete = this.allProducts.find(
        (product) => product.id === productId
      );
      if (productToDelete) {
        this.firebaseService.deleteImage(productToDelete.imageUrl).subscribe(
          () => {
            console.log('Imaginea a fost ștearsă cu succes');
            this.firebaseService.delete(productId, 'products').subscribe(
              () => {
                console.log('Produsul a fost șters cu succes:', productId);
                this.allProducts = this.allProducts.filter(
                  (product) => product.id !== productId
                );
                this.filterProducts();
              },
              (error) => {
                console.error('Eroare la ștergerea produsului:', error);
              }
            );
          },
          (error) => {
            console.error('Eroare la ștergerea imaginii:', error);
          }
        );
      }
    }
  }
}
