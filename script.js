import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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

console.log("Firebase conectado!");
const ADMIN = "Ana";
const SALDO_INICIAL = 10000;
const SALARIO = 10000;
const TEMPO_SALARIO = 600000; // 10 min

let currentUser = null;

// ======================
// BASE DE DADOS
// ======================
function getDB(){
    return JSON.parse(localStorage.getItem("BANK_DB") || "{}");
}

function saveDB(db){
    localStorage.setItem("BANK_DB", JSON.stringify(db));
}

// ======================
// UTILIDADES
// ======================
function getTime(){
    return new Date().toLocaleString();
}

function generateAccount(){
    return "10" + Math.floor(Math.random() * 900000000);
}

// ======================
// REGISTO
// ======================
function register(){

    let u = document.getElementById("username").value;
    let p = document.getElementById("password").value;

    let db = getDB();

    if(db[u]){
        alert("Usuário já existe!");
        return;
    }

    db[u] = {
        pass: p,
        saldo: SALDO_INICIAL,
        conta: generateAccount(),
        poupanca: 0,
        emprestimos: [],
        historico: [],
        notif: [],
        lastSalary: Date.now()
    };

    saveDB(db);

    alert("Conta criada! Número: " + db[u].conta);
}

// ======================
// LOGIN
// ======================
function login(){

    let u = document.getElementById("username").value;
    let p = document.getElementById("password").value;

    let db = getDB();

    if(db[u] && db[u].pass === p){

        currentUser = u;

        document.getElementById("loginScreen").classList.add("hidden");
        document.getElementById("appScreen").classList.remove("hidden");

        load();
        salaryCheck();

    }else{
        alert("Login inválido!");
    }
}

// ======================
// LOGOUT
// ======================
function logout(){
    localStorage.removeItem("BANK_SESSION");
    location.reload();
}

// ======================
// CARREGAR DASHBOARD
// ======================
function load(){

    let db = getDB();
    let u = db[currentUser];

    document.getElementById("userDisplay").innerText = currentUser;
    document.getElementById("saldo").innerText = u.saldo;
    document.getElementById("contaNumero").innerText = u.conta;

    loadHistory();
    checkAdmin();
}

// ======================
// HISTÓRICO
// ======================
function addHistory(msg){

    let db = getDB();

    db[currentUser].historico.push("[" + getTime() + "] " + msg);

    saveDB(db);
}

function loadHistory(){

    let db = getDB();
    let list = document.getElementById("historico");

    list.innerHTML = "";

    db[currentUser].historico.slice().reverse().forEach(h => {
        let li = document.createElement("li");
        li.innerText = h;
        list.appendChild(li);
    });
}

// ======================
// DEPÓSITO
// ======================
function depositar(){

    let v = Number(document.getElementById("dep").value);

    let db = getDB();

    db[currentUser].saldo += v;

    addHistory("Depósito +" + v);

    saveDB(db);

    load();
}

// ======================
// TRANSFERÊNCIA POR CONTA
// ======================
function transferir(){

    let conta = document.getElementById("toUser").value;
    let v = Number(document.getElementById("valor").value);

    let db = getDB();

    let sender = db[currentUser];
    let receiver = null;

    for(let u in db){
        if(db[u].conta === conta){
            receiver = u;
        }
    }

    if(!receiver){
        alert("Conta não encontrada!");
        return;
    }

    if(sender.saldo < v){
        alert("Saldo insuficiente!");
        return;
    }

    sender.saldo -= v;
    db[receiver].saldo += v;

    addHistory("Transferiu " + v + " para " + receiver);
    db[receiver].historico.push("[" + getTime() + "] Recebeu +" + v);

    saveDB(db);
    load();
}

// ======================
// EMPRÉSTIMO (PEDIDO)
// ======================
function emprestimo(){

    let v = Number(document.getElementById("valorEmprestimo").value);

    let db = getDB();

    db[currentUser].emprestimos.push({
        valor: v,
        status: "pendente"
    });

    db["ADMIN_REQUESTS"] = db["ADMIN_REQUESTS"] || [];
    db["ADMIN_REQUESTS"].push({
        user: currentUser,
        valor: v
    });

    saveDB(db);

    alert("Pedido enviado ao admin!");
}

// ======================
// POUPANÇA
// ======================
function guardarPoupanca(){

    let v = Number(document.getElementById("valorPoupanca").value);

    let db = getDB();

    if(db[currentUser].saldo < v){
        alert("Saldo insuficiente!");
        return;
    }

    db[currentUser].saldo -= v;
    db[currentUser].poupanca += v;

    addHistory("Guardou poupança +" + v);

    saveDB(db);

    load();
}

// ======================
// ADMIN
// ======================
function checkAdmin(){

    if(currentUser === ADMIN){
        document.getElementById("adminPanel").classList.remove("hidden");
    }
}

function giveMoney(){

    if(currentUser !== ADMIN){
        alert("Apenas admin!");
        return;
    }

    let u = document.getElementById("adminUser").value;
    let v = Number(document.getElementById("adminValue").value);

    let db = getDB();

    db[u].saldo += v;

    db[u].historico.push("Admin +" + v);

    saveDB(db);

    load();
}

// ======================
// SALÁRIO AUTOMÁTICO
// ======================
function salaryCheck(){

    let db = getDB();
    let u = db[currentUser];

    if(Date.now() - u.lastSalary > TEMPO_SALARIO){

        u.saldo += SALARIO;
        u.lastSalary = Date.now();

        addHistory("Salário +" + SALARIO);

        saveDB(db);

        load();
    }
}

// ======================
// AUTO SALVAMENTO
// ======================
setInterval(() => {
    if(currentUser){
        salaryCheck();
        load();
    }
}, 5000);
