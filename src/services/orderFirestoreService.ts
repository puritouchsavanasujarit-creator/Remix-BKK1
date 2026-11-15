import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { OrderItem } from '../types/sop';

const COLLECTION_NAME = 'orders';

export function subscribeToOrders(
  onData: (orders: OrderItem[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, COLLECTION_NAME);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: OrderItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as OrderItem;
        items.push({
          ...data,
          id: docSnap.id,
        });
      });
      // Sort newest first
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(items);
    },
    (error) => {
      const formatted = handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      if (onError) onError(formatted);
    }
  );
}

export async function saveOrderToFirestore(order: OrderItem): Promise<void> {
  const path = `${COLLECTION_NAME}/${order.id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, order.id);
    const payload = {
      ...order,
      userId: auth.currentUser?.uid || 'anonymous',
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    throw handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${orderId}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, orderId);
    await deleteDoc(docRef);
  } catch (error) {
    throw handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function checkAndSeedInitialOrders(initialOrders: OrderItem[]): Promise<void> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.log('Seeding initial orders to Firestore...');
      for (const ord of initialOrders) {
        await saveOrderToFirestore(ord);
      }
    }
  } catch (err) {
    console.warn('Initial seeding bypassed or requires auth:', err);
  }
}
