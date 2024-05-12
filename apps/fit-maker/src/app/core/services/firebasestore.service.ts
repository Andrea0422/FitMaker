import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  setDoc,
  query,
  where,
  docData,
  deleteDoc,
  WhereFilterOp,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

@Injectable()
export class FireBaseStoreService {
  private readonly firestore = inject(Firestore);

  addCollectionData(collectionName: string, data: any): Observable<any> {
    const collectionRef = collection(this.firestore, collectionName);
    const dataRef = from(addDoc(collectionRef, { ...data }));
    return dataRef;
  }
}
