import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';

interface PurchasedProduct {
  id: string;
  name: string;
  address: string;
  phone: string;
  idproduct: string;
  createdDate: Timestamp | Date;
  cnp: string;
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
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Se încarcă produsele achiziționate...');
    this.loadPurchasedProducts();
  }

  loadPurchasedProducts() {
    const purchasedProducts$ = this.firebaseService.getPurchasedProducts();
    const products$ = this.firebaseService.getCollention('products');

    this.orders$ = combineLatest([purchasedProducts$, products$]).pipe(
      map(([purchasedProducts, products]) => {
        console.log('Produse achiziționate:', purchasedProducts);
        console.log('Produse:', products);
        return purchasedProducts.map((purchasedProduct: any) => {
          if (!purchasedProduct.createdDate) {
            console.log(
              'Nu s-a găsit createdDate pentru produsul achiziționat:',
              purchasedProduct
            );
            return {
              ...purchasedProduct,
              productName: 'Produs necunoscut',
              productPrice: 'Preț necunoscut',
              createdDate: new Date(),
            };
          }

          const date =
            purchasedProduct.createdDate instanceof Timestamp
              ? purchasedProduct.createdDate.toDate()
              : purchasedProduct.createdDate;

          if (!(date instanceof Date)) {
            console.log(
              'createdDate nu este de tip Date pentru produsul achiziționat:',
              purchasedProduct
            );
            return {
              ...purchasedProduct,
              productName: 'Produs necunoscut',
              productPrice: 'Preț necunoscut',
              createdDate: new Date(),
            };
          }

          return {
            ...purchasedProduct,
            productName:
              getProductById(purchasedProduct.idproduct, products)?.name ||
              'Produs necunoscut',
            productPrice:
              getProductById(purchasedProduct.idproduct, products)?.price ||
              'Preț necunoscut',
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
    console.log('Se aplică filtrul cu query-ul de căutare:', this.searchQuery);
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
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.error('Utilizatorul curent nu a fost găsit.');
      return;
    }

    const purchasedProduct = {
      name: order.name,
      address: order.address,
      phone: order.phone,
      idproduct: order.idproduct,
      cnp: order.cnp,
      createdDate: new Date(),
      uid: currentUser.uid,
      id: order.id,
    };
    console.log(purchasedProduct);

    this.firebaseService
      .update(purchasedProduct, 'purchasedProducts')
      .subscribe({
        next: () => {
          console.log('Produs achiziționat cu succes', purchasedProduct);
          order.editing = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Eroare la achiziționarea produsului: ', error);
        },
      });
  }

  async downloadInvoice(order: any) {
    const doc = new jsPDF();

    const logo = await this.getBase64ImageFromURL('/assets/images/fitlogo.png');
    const marginLeft = 10;
    const marginTop = 20;
    const rightMargin = 200;

    doc.addImage(logo, 'PNG', marginLeft, marginTop, 50, 20);

    // Detalii firmă
    const firmDetails = [
      'FitMaker GYM',
      'fitmaker.ro@gmail.com',
      '0778654765',
      'Bd. Republicii, Baia Mare, Maramures',
      'RO154367',
    ];

    doc.setFontSize(12);
    const firmDetailsX = 120;
    let firmDetailsY = marginTop + 10;
    firmDetails.forEach((line) => {
      doc.text(line, firmDetailsX, firmDetailsY);
      firmDetailsY += 6;
    });

    // Informații client și comandă
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Factura pentru:', marginLeft, marginTop + 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nume: ${order.name}`, marginLeft, marginTop + 60);
    doc.text(`Adresa: ${order.address}`, marginLeft, marginTop + 70);
    doc.text(`Telefon: ${order.phone}`, marginLeft, marginTop + 80);
    doc.text(`CNP: ${order.cnp}`, marginLeft, marginTop + 90);

    // Data comenzii
    const orderDate =
      order.createdDate instanceof Date
        ? order.createdDate.toLocaleDateString()
        : new Date(order.createdDate).toLocaleDateString();
    doc.text(`Data comenzii: ${orderDate}`, marginLeft, marginTop + 100);

    // Linie orizontală sub informațiile clientului
    doc.line(marginLeft, marginTop + 110, rightMargin - 10, marginTop + 110);

    // Detalii produs și preț
    doc.setFontSize(14);
    doc.text(`Produs: ${order.productName}`, marginLeft, marginTop + 120);
    const totalPrice = parseFloat(order.productPrice);
    const tva = (totalPrice * 0.19).toFixed(2);
    doc.text(
      `Pret cu TVA inclus: ${totalPrice.toFixed(2)} RON`,
      rightMargin - 10,
      marginTop + 120,
      { align: 'right' }
    );
    doc.text(
      `TVA (19% din total): ${tva} RON`,
      rightMargin - 10,
      marginTop + 130,
      { align: 'right' }
    );
    doc.setFont('helvetica', 'bold');
    doc.text(
      `TOTAL: ${totalPrice.toFixed(2)} RON`,
      rightMargin - 10,
      marginTop + 140,
      { align: 'right' }
    );

    doc.save(`Factura_${order.name}.pdf`);
  }

  getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } else {
          reject('Nu s-a putut obține contextul canvas');
        }
      };
      img.onerror = (err) => {
        reject(err);
      };
      img.src = url;
    });
  }

  ngOnDestroy() {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }
}

function getProductById(id: string, products: any[]): Product | undefined {
  return products.find((product) => product.id === id);
}
