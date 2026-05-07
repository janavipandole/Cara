import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyAeixdgwXM0AKNanKhEaRcQKzKEl2vgr5E",
  authDomain: "precision-58983.firebaseapp.com",
  projectId: "precision-58983",
  storageBucket: "precision-58983.firebasestorage.app",
  messagingSenderId: "843334805854",
  appId: "1:843334805854:web:2b31ec97d9376eb74947cf",
  measurementId: "G-1SZWCS51B7"
}

let auth
try {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
} catch (e) {
  console.error('Firebase init failed:', e)
  auth = null
}

export { auth }