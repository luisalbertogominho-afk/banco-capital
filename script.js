import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "banco-capital-80301.firebaseapp.com",
  projectId: "banco-capital-80301",
  storageBucket: "banco-capital-80301.appspot.com",
  messagingSenderId: "100813168779",
  appId: "1:100813168779:web:dbb1df17d16395a4c3b48e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// ================= REGISTER =================
async function register() {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      saldo: 10000,
      conta: Math.floor(Math.random() * 900000000),
      criadoEm: new Date()
    });

    alert("Conta criada com sucesso!");

    await login();

  } catch (e) {
    alert("Erro: " + e.message);
  }
}

// ================= LOGIN =================
async function login() {
  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    currentUser = user.uid;

    await loadUserData();

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("appScreen").classList.remove("hidden");

  } catch (e) {
    alert("Erro login: " + e.message);
  }
}

// ================= LOGOUT =================
function logout() {
  signOut(auth);
  location.reload();
}

// ================= CARREGAR DADOS =================
async function loadUserData() {
  const snap = await getDoc(doc(db, "usuarios", currentUser));

  if (!snap.exists()) return;

  const data = snap.data();

  document.getElementById("userDisplay").innerText = data.email;
  document.getElementById("saldo").innerText = data.saldo;
  document.getElementById("contaNumero").innerText = data.conta;
}

// ================= TRANSFERÊNCIA =================
async function transferir() {
  const contaDestino = document.getElementById("contaDestino").value;
  const valor = Number(document.getElementById("valorTransferencia").value);

  const userRef = doc(db, "usuarios", currentUser);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();

  if (userData.saldo < valor) {
    alert("Saldo insuficiente!");
    return;
  }

  // procurar destino
  const destinoRef = doc(db, "usuarios", contaDestino);
  const destinoSnap = await getDoc(destinoRef);

  if (!destinoSnap.exists()) {
    alert("Conta não encontrada!");
    return;
  }

  const destinoData = destinoSnap.data();

  await updateDoc(userRef, {
    saldo: userData.saldo - valor
  });

  await updateDoc(destinoRef, {
    saldo: destinoData.saldo + valor
  });

  alert("Transferência feita!");

  await loadUserData();
}

// ================= EXPOR FUNÇÕES =================
window.register = register;
window.login = login;
window.logout = logout;
window.transferir = transferir;
