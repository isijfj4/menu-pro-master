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
    console.log('🔥 [FIREBASE] Inicializando Firebase Service...');
    
    // Verificar configuración
    console.log('🔧 [FIREBASE] Verificando configuración:', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasAuthDomain: !!firebaseConfig.authDomain,
      hasProjectId: !!firebaseConfig.projectId,
      hasStorageBucket: !!firebaseConfig.storageBucket,
      hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
      hasAppId: !!firebaseConfig.appId,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

    // Verificar variables de entorno críticas
    if (!firebaseConfig.projectId) {
      console.error('❌ [FIREBASE] NEXT_PUBLIC_FIREBASE_PROJECT_ID no está configurado');
    }
    if (!firebaseConfig.storageBucket) {
      console.error('❌ [FIREBASE] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET no está configurado');
    }
    if (!firebaseConfig.apiKey) {
      console.error('❌ [FIREBASE] NEXT_PUBLIC_FIREBASE_API_KEY no está configurado');
    }

    try {
      // Inicializa Firebase solo si no hay instancias previas
      const existingApps = getApps();
      console.log('📱 [FIREBASE] Apps existentes:', existingApps.length);
      
      this.app = existingApps.length > 0 ? getApp() : initializeApp(firebaseConfig);
      console.log('✅ [FIREBASE] App inicializada:', {
        name: this.app.name,
        projectId: this.app.options.projectId,
        storageBucket: this.app.options.storageBucket
      });

      this._firestore = getFirestore(this.app);
      console.log('✅ [FIREBASE] Firestore inicializado');

      this._storage = getStorage(this.app);
      console.log('✅ [FIREBASE] Storage inicializado:', {
        bucket: this._storage.app.options.storageBucket,
        maxOperationRetryTime: this._storage.maxOperationRetryTime,
        maxUploadRetryTime: this._storage.maxUploadRetryTime
      });

      this._auth = getAuth(this.app);
      console.log('✅ [FIREBASE] Auth inicializado');

      console.log('🎉 [FIREBASE] Firebase Service inicializado correctamente');
    } catch (error) {
      console.error('💥 [FIREBASE] Error al inicializar Firebase:', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        errorStack: error instanceof Error ? error.stack : undefined,
        config: {
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket,
          authDomain: firebaseConfig.authDomain
        },
        timestamp: new Date().toISOString()
      });
      throw error;
    }
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
