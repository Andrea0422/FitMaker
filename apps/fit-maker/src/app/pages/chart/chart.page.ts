import { Component, OnInit, OnDestroy } from '@angular/core';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import Chart from 'chart.js/auto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'chart-app',
  templateUrl: './chart.page.html',
})
export class ChartPage implements OnInit, OnDestroy {
  mostPurchasedProduct: string = '';
  mostPurchasedSubscription: string = '';
  chartInstance: Chart | null = null;
  productCount: number = 0;
  subscriptionCount: number = 0;

  private productSubscription: Subscription | null = null;
  private subscriptionSubscription: Subscription | null = null;

  constructor(private firestoreService: FireBaseStoreService) {}

  ngOnInit(): void {
    console.log('Component initialized.');
    this.loadMostPurchased();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  private unsubscribeAll(): void {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
    if (this.subscriptionSubscription) {
      this.subscriptionSubscription.unsubscribe();
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  loadMostPurchased(): void {
    console.log('Loading most purchased product and subscription...');
    this.getMostPurchasedProduct();
    this.getMostPurchasedSubscription();
  }

  getMostPurchasedProduct(): void {
    console.log('Fetching purchased products...');
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
    this.productSubscription = this.firestoreService
      .getPurchasedProducts()
      .subscribe((purchasedProducts) => {
        console.log('Purchased products:', purchasedProducts);
        const productCounts = this.countItems(purchasedProducts, 'idproduct');
        console.log('Product counts:', productCounts);
        const mostPurchasedProductId = this.findMaxValueKey(productCounts);
        console.log('Most purchased product id:', mostPurchasedProductId);

        if (mostPurchasedProductId) {
          this.firestoreService.getProducts().subscribe((products) => {
            console.log('Products:', products);
            const product = products.find(
              (p) => p.id === mostPurchasedProductId
            );
            console.log('Most purchased product:', product);
            this.mostPurchasedProduct = product ? product.name : 'Unknown';
            console.log(
              'Most purchased product name:',
              this.mostPurchasedProduct
            );
            this.productCount = productCounts[mostPurchasedProductId] || 0;
            console.log('Product count:', this.productCount);
            this.updateChart(productCounts, products);
          });
        }
      });
  }

  getMostPurchasedSubscription(): void {
    console.log('Fetching purchased subscriptions...');
    if (this.subscriptionSubscription) {
      this.subscriptionSubscription.unsubscribe();
    }
    this.subscriptionSubscription = this.firestoreService
      .getPurchasedSubscriptions()
      .subscribe((purchasedSubs) => {
        console.log('Purchased subscriptions:', purchasedSubs);
        const subscriptionCounts = this.countItems(
          purchasedSubs,
          'idsubscription'
        );
        console.log('Subscription counts:', subscriptionCounts);
        const mostPurchasedSubscriptionId =
          this.findMaxValueKey(subscriptionCounts);
        console.log(
          'Most purchased subscription id:',
          mostPurchasedSubscriptionId
        );

        if (mostPurchasedSubscriptionId) {
          this.firestoreService
            .getSubscriptions()
            .subscribe((subscriptions) => {
              console.log('Subscriptions:', subscriptions);
              const subscription = subscriptions.find(
                (s) => s.id === mostPurchasedSubscriptionId
              );
              console.log('Most purchased subscription:', subscription);
              this.mostPurchasedSubscription = subscription
                ? `${subscription.period} ${subscription.price} ${subscription.currency}`
                : 'Unknown';
              console.log(
                'Most purchased subscription details:',
                this.mostPurchasedSubscription
              );
              this.subscriptionCount =
                subscriptionCounts[mostPurchasedSubscriptionId] || 0;
              console.log('Subscription count:', this.subscriptionCount);
              this.updateChart(subscriptionCounts, subscriptions);
            });
        }
      });
  }

  countItems(items: any[], idField: string): any {
    return items.reduce((acc, item) => {
      const itemId = item[idField];
      acc[itemId] = (acc[itemId] || 0) + 1;
      return acc;
    }, {});
  }

  findMaxValueKey(obj: any): string | null {
    let maxKey = null;
    let maxValue = -1;

    Object.keys(obj).forEach((key) => {
      if (obj[key] > maxValue) {
        maxValue = obj[key];
        maxKey = key;
      }
    });

    return maxKey;
  }

  updateChart(productCounts: any, products: any[]): void {
    const chartCanvas = document.getElementById('myChart') as HTMLCanvasElement;
    if (chartCanvas) {
      const ctx = chartCanvas.getContext('2d');

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const productData = products.map((product) => ({
        id: product.id,
        name: product.name,
        count: productCounts[product.id] || 0,
      }));

      productData.sort((a, b) => b.count - a.count);

      this.firestoreService
        .getPurchasedSubscriptions()
        .subscribe((purchasedSubs) => {
          const subscriptionCounts = this.countItems(
            purchasedSubs,
            'idsubscription'
          );

          this.firestoreService
            .getSubscriptions()
            .subscribe((subscriptions) => {
              const subscriptionData = subscriptions.map((subscription) => ({
                id: subscription.id,
                details: `${subscription.period} ${subscription.price} ${subscription.currency}`,
                count: subscriptionCounts[subscription.id] || 0,
              }));

              subscriptionData.sort((a, b) => b.count - a.count);

              const labels = [
                ...productData.map((product) => product.name),
                ...subscriptionData.map((subscription) => subscription.details),
              ];

              const counts = [
                ...productData.map((product) => product.count),
                ...subscriptionData.map((subscription) => subscription.count),
              ];

              const backgroundColors = [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 159, 64, 0.6)',
              ];

              const borderColors = [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 159, 64, 1)',
              ];

              this.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: 'Vanzari',
                      data: counts,
                      backgroundColor: backgroundColors.slice(0, counts.length),
                      borderColor: borderColors.slice(0, counts.length),
                      borderWidth: 1,
                    },
                  ],
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Vanzari',
                      },
                    },
                  },
                },
              });
            });
        });
    }
  }
}
