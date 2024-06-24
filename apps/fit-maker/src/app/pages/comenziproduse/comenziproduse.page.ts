import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

interface PurchasedProduct {
  id: string;
  name: string;
  address: string;
  phone: string;
  idproduct: string;
  createdDate: Timestamp;
}

interface Product {
  id: string;
  name: string;
  price: string;
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-comenziproduse',
  templateUrl: './comenziproduse.page.html',
})
export class ComenziProdusePage implements OnInit {
  orders$: Observable<any[]> | undefined;
  filteredOrders: any[] = [];
  searchQuery: string = '';
  ordersSubscription: Subscription | undefined;

  constructor(
    private firebaseService: FireBaseStoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Loading purchased products...');
    this.loadPurchasedProducts();
  }

  loadPurchasedProducts() {
    const purchasedProducts$ = this.firebaseService.getPurchasedProducts();
    const products$ = this.firebaseService.getCollention('products');

    this.orders$ = combineLatest([purchasedProducts$, products$]).pipe(
      map(([purchasedProducts, products]) => {
        console.log('Purchased Products:', purchasedProducts);
        console.log('Products:', products);
        return purchasedProducts.map((purchasedProduct: any) => {
          if (!purchasedProduct.idproduct) {
            console.log(
              'No idproduct found for purchased product:',
              purchasedProduct
            );
            return {
              ...purchasedProduct,
              productName: 'Unknown Product',
              productPrice: 'Unknown Price',
              createdDate: purchasedProduct.createdDate.toDate(),
            };
          }

          const product = products.find(
            (p: Product) => p.id === purchasedProduct.idproduct
          );
          if (!product) {
            console.log(
              `No matching product found for idproduct: ${purchasedProduct.idproduct}`
            );
            return {
              ...purchasedProduct,
              productName: 'Unknown Product',
              productPrice: 'Unknown Price',
              createdDate: purchasedProduct.createdDate.toDate(),
            };
          }

          return {
            ...purchasedProduct,
            productName: product.name,
            productPrice: product.price,
            createdDate: purchasedProduct.createdDate.toDate(),
          };
        });
      })
    );

    if (this.orders$) {
      this.ordersSubscription = this.orders$.subscribe((orders) => {
        this.filteredOrders = orders;
        this.filteredOrders.forEach((order: any) => (order.editing = false));
        this.filterOrders();
        this.cdr.detectChanges();
      });
    }
  }

  filterOrders(): void {
    console.log('filterOrders called with searchQuery:', this.searchQuery);
    if (!this.searchQuery) {
      if (this.orders$) {
        this.orders$.subscribe((orders) => {
          this.filteredOrders = orders;
          this.filteredOrders.forEach((order: any) => (order.editing = false));
          this.cdr.detectChanges();
        });
      }
    } else {
      const query = this.searchQuery.toLowerCase();
      if (this.orders$) {
        this.orders$.subscribe((orders) => {
          this.filteredOrders = orders.filter(
            (order: any) =>
              order.name.toLowerCase().includes(query) ||
              order.phone.includes(this.searchQuery) ||
              order.productName.toLowerCase().includes(query)
          );
          this.filteredOrders.forEach((order: any) => (order.editing = false));
          this.cdr.detectChanges();
        });
      }
    }
  }

  enableEditing(order: any) {
    order.editing = true;
  }

  cancelEditing(order: any) {
    order.editing = false;
  }

  saveOrder(order: any) {
    this.firebaseService
      .updateOrder(order.id, {
        name: order.name,
        address: order.address,
        phone: order.phone,
      })
      .then(() => {
        order.editing = false;
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Error updating order:', error);
      });
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }
}
