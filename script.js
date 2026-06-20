// ======================
// BANCO CAPITAL PRO
// PARTE 1
// ======================

const ADMIN_NAME = "Ana";
const START_MONEY = 10000;
const SALARY_AMOUNT = 10000;
const SALARY_TIME = 600000; // 10 minutos

let currentUser = null;

// Base de dados
function getBank(){
    return JSON.parse(localStorage.getItem("BancoCapitalDB") || "{}");
}

function saveBank(data){
    localStorage.setItem("BancoCapitalDB", JSON.stringify(data));
}

// Sessão
function saveSession(user){
    localStorage.setItem("BancoCapitalSession", user);
}

function getSession(){
    return localStorage.getItem("BancoCapitalSession");
}

function clearSession(){
    localStorage.removeItem("BancoCapitalSession");
}

// Número da conta
function generateAccount(){
    return Math.floor(
        10000000 + Math.random() * 90000000
    ).toString();
}

// Data/Hora
function getDateTime(){
    return new Date().toLocaleString();
}

// Histórico
function addHistory(user, msg){
    let db = getBank();

    db[user].hist.push(
        "[" + getDateTime() + "] " + msg
    );

    saveBank(db);
}

// Registro
function register(){

    let username =
        document.getElementById("username").value.trim();

    let password =
        document.getElementById("password").value.trim();

    if(!username || !password){
        alert("Preencha todos os campos!");
        return;
    }

    let db = getBank();

    if(db[username]){
        alert("Usuário já existe!");
        return;
    }

    db[username] = {
        password: password,
        saldo: START_MONEY,
        poupanca: 0,
        emprestimo: 0,
        conta: generateAccount(),
        hist: [
            "[" + getDateTime() + "] Conta criada."
        ],
        notifications: [],
        lastSalary: Date.now()
    };

    saveBank(db);

    alert(
        "Conta criada com sucesso!\nConta Nº: " +
        db[username].conta
    );
}

// Login
function login(){

    let username =
        document.getElementById("username").value.trim();

    let password =
        document.getElementById("password").value.trim();

    let db = getBank();

    if(
        db[username] &&
        db[username].password === password
    ){

        currentUser = username;

        saveSession(username);

        document
            .getElementById("loginScreen")
            .classList.add("hidden");

        document
            .getElementById("appScreen")
            .classList.remove("hidden");

        loadDashboard();

    }else{
        alert("Usuário ou senha incorretos.");
    }
}

// Logout
function logout(){

    clearSession();

    location.reload();
}
