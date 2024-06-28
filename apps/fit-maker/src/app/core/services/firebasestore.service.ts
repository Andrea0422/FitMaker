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
  updateDoc,
  DocumentReference,
  DocumentData,
  getDoc,
  DocumentSnapshot,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable()
export class FireBaseStoreService {
  private readonly firestore = inject(Firestore);
  constructor(private storage: AngularFireStorage) {}

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
      q = query(collection(this.firestore, collectionName));
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
    return from(
      setDoc(collectionRef, Object.assign({}, { id: undefined, ...data }))
    );
  }

  delete(id: any, collectionName: any): Observable<any> {
    const collectionRef = doc(this.firestore, `${collectionName}/${id}`);
    return from(deleteDoc(collectionRef));
  }
  getDocumentById(collectionName: string, documentId: string): Observable<any> {
    const documentRef: DocumentReference<DocumentData> = doc(
      this.firestore,
      collectionName,
      documentId
    );
    return new Observable<any>((observer) => {
      getDoc(documentRef)
        .then((docSnapshot: DocumentSnapshot<DocumentData>) => {
          if (docSnapshot.exists()) {
            observer.next({ id: docSnapshot.id, ...docSnapshot.data() });
          } else {
            observer.next(null);
          }
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
  updateDocument(
    collectionName: string,
    documentId: string,
    data: any
  ): Observable<any> {
    const documentRef = doc(this.firestore, collectionName, documentId);
    return from(updateDoc(documentRef, data));
  }

  getPurchasedProducts(): Observable<any[]> {
    const collectionRef = collection(this.firestore, 'purchasedProducts');
    return collectionData(collectionRef, { idField: 'id' });
  }

  getPurchasedSubscriptions(): Observable<any[]> {
    const collectionRef = collection(this.firestore, 'purchasedSubs');
    return collectionData(collectionRef, { idField: 'id' });
  }

  getProducts(): Observable<any[]> {
    const collectionRef = collection(this.firestore, 'products');
    return collectionData(collectionRef, { idField: 'id' });
  }

  getSubscriptions(): Observable<any[]> {
    const collectionRef = collection(this.firestore, 'subscriptions');
    return collectionData(collectionRef, { idField: 'id' });
  }

  updateOrder(orderId: string, updatedData: any) {
    const orderDocRef = doc(this.firestore, `purchasedProducts/${orderId}`);
    return updateDoc(orderDocRef, updatedData);
  }

  deleteImage(imageUrl: string): Observable<void> {
    const imageRef = this.storage.refFromURL(imageUrl);
    return imageRef.delete();
  }
}
