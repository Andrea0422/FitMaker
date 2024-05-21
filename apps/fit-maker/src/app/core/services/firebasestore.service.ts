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

  getCustomCollention<T>(
    collectionName: string,
    customCondition?: any
  ): Observable<T[]> {
    let q;
    if (customCondition) {
      q = query(
        collection(this.firestore, collectionName),
        where(
          customCondition.firstField as string,
          customCondition.condition as WhereFilterOp,
          customCondition.secondField as string
        )
      );
    } else {
      q = query(
        collection(this.firestore, collectionName))
    }
    const getColectionData = collectionData(q, { idField: 'id' });

    return getColectionData as Observable<T[]>;
  }

  getCollention(collectionName: string): Observable<any> {
    const q = query(collection(this.firestore, collectionName));
    const getColectionData = collectionData(q, { idField: 'id' });

    return getColectionData as Observable<any>;
  }

  update<T>(data: any, collectionName: any): Observable<any> {
    const collectionRef = doc(this.firestore, `${collectionName}/${data.id}`);
    return from(setDoc(collectionRef, Object.assign({}, data)));
  }

  delete(id: any, collectionName: any): Observable<any> {
    const collectionRef = doc(this.firestore, `${collectionName}/${id}`);
    return from(deleteDoc(collectionRef));
  }
}
