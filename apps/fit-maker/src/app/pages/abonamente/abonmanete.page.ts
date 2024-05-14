import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FireBaseStoreService } from '../../core/services/firebasestore.service';
import { NgFor } from '@angular/common';
import { first } from 'rxjs';

@Component({
  selector: 'app-abonament-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgFor],
  templateUrl: './abonamente.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbonamentePage implements OnInit {
  subscriptionList = [];
  protected readonly fireBaseStoreService = inject(FireBaseStoreService);
  protected readonly changeDetector = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.fireBaseStoreService
      .getCollention('subscriptions')
      .pipe(first())
      .subscribe((response) => {
        console.log(response);
        this.subscriptionList = response;
        this.changeDetector.detectChanges();
        console.log(this.subscriptionList);
      });
  }
}
