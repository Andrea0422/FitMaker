import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { getAuth } from '@firebase/auth';
import { provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { AuthService } from './core/services/auth.service';
import { AsyncPipe } from '@angular/common';
import { FireBaseStoreService } from './core/services/firebasestore.service';

const firebaseConfig = {
  apiKey: 'AIzaSyBIJrfqZ_QefFMxjvZINkIveRKrsqD7X5U',
  authDomain: 'fitmaker-database.firebaseapp.com',
  projectId: 'fitmaker-database',
  storageBucket: 'fitmaker-database.appspot.com',
  messagingSenderId: '114878709341',
  appId: '1:114878709341:web:e2c8369e60efdbcb37d7b4',
};

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [
    BrowserModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    RouterModule.forRoot([...appRoutes]),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    AsyncPipe,
  ],
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: firebaseConfig },
    FireBaseStoreService,
    {
      provide: AuthService,
      useClass: AuthService,
      deps: [FireBaseStoreService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
