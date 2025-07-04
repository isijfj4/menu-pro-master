import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Configuración de Firebase
 * Reemplazar con tus propias credenciales
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Clase singleton para la inicialización de Firebase
 * Garantiza una única instancia de Firebase en toda la aplicación
 */
class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp;
  private _firestore: Firestore;
  private _storage: FirebaseStorage;
  private _auth: Auth;

  private constructor() {
    // Inicializa Firebase solo si no hay instancias previas
    this.app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    this._firestore = getFirestore(this.app);
    this._storage = getStorage(this.app);
    this._auth = getAuth(this.app);
  }

  /**
   * Obtiene la instancia única de FirebaseService
   */
  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Obtiene la instancia de Firestore
   */
  get firestore(): Firestore {
    return this._firestore;
  }

  /**
   * Obtiene la instancia de Storage
   */
  get storage(): FirebaseStorage {
    return this._storage;
  }

  /**
   * Obtiene la instancia de Auth
   */
  get auth(): Auth {
    return this._auth;
  }
}

// Exporta las instancias de Firebase para uso en la aplicación
export const firebase = FirebaseService.getInstance();
export const db = firebase.firestore;
export const storage = firebase.storage;
export const auth = firebase.auth;

// Exporta tipos específicos de Firebase para uso en la aplicación
// Evitamos re-exportar todo para prevenir conflictos de nombres

// Exportaciones de valores (no tipos)
// Desde Firestore
export { Timestamp } from 'firebase/firestore';

// Desde Storage
export { 
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
  uploadString,
  deleteObject
} from 'firebase/storage';

// Desde Auth
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// Exportaciones de tipos
export type { 
  DocumentData, 
  QueryDocumentSnapshot, 
  DocumentSnapshot,
  QuerySnapshot,
  CollectionReference,
  DocumentReference,
  Query,
  WhereFilterOp,
  OrderByDirection,
  FieldPath,
  FieldValue,
  WriteBatch,
  Transaction
} from 'firebase/firestore';

export type {
  StorageReference,
  UploadResult,
  UploadTask,
  UploadTaskSnapshot
} from 'firebase/storage';

export type {
  User,
  UserCredential
} from 'firebase/auth';
