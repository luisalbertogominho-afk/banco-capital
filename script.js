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

// ======================
// BANCO CAPITAL PRO
// PARTE 2
// ======================

// Dashboard
function loadDashboard(){

    let db = getBank();

    if(!db[currentUser]) return;

    let user = db[currentUser];

    document.getElementById("userDisplay").innerText =
        "👤 " + currentUser;

    document.getElementById("saldo").innerText =
        "$" + user.saldo.toLocaleString();

    document.getElementById("contaNumero").innerText =
        user.conta;

    loadHistory();
    loadRanking();
    checkAdmin();
    checkSalary();
}

// Histórico
function loadHistory(){

    let db = getBank();

    let list =
        document.getElementById("historico");

    list.innerHTML = "";

    db[currentUser].hist
    .slice()
    .reverse()
    .forEach(item => {

        let li =
            document.createElement("li");

        li.innerText = item;

        list.appendChild(li);
    });
}

// Ranking
function loadRanking(){

    let db = getBank();

    let ranking =
        document.getElementById("ranking");

    ranking.innerHTML = "";

    let users =
        Object.keys(db).map(name => {

            return {
                name: name,
                saldo: db[name].saldo
            };

        });

    users.sort(
        (a,b) => b.saldo - a.saldo
    );

    users.slice(0,10).forEach(user => {

        let li =
            document.createElement("li");

        li.innerText =
            user.name +
            " - $" +
            user.saldo.toLocaleString();

        ranking.appendChild(li);

    });
}

// Painel Admin
function checkAdmin(){

    if(currentUser === ADMIN_NAME){

        document
        .getElementById("adminPanel")
        .classList.remove("hidden");

    }else{

        document
        .getElementById("adminPanel")
        .classList.add("hidden");

    }
}

// Dar dinheiro
function giveMoney(){

    if(currentUser !== ADMIN_NAME){

        alert("Apenas Ana pode usar.");
        return;

    }

    let user =
        document.getElementById("adminUser").value;

    let value =
        Number(
            document.getElementById("adminValor").value
        );

    let db = getBank();

    if(!db[user]){

        alert("Usuário não encontrado.");
        return;

    }

    db[user].saldo += value;

    db[user].notifications.push(
        "👑 Administração enviou $" +
        value.toLocaleString()
    );

    addHistory(
        user,
        "Administração enviou $" +
        value.toLocaleString()
    );

    saveBank(db);

    alert("Dinheiro enviado.");

    loadDashboard();
}

// Salário automático
function checkSalary(){

    let db = getBank();

    let user = db[currentUser];

    let now = Date.now();

    if(
        now - user.lastSalary >= SALARY_TIME
    ){

        user.saldo += SALARY_AMOUNT;

        user.lastSalary = now;

        user.notifications.push(
            "💰 Salário recebido: $" +
            SALARY_AMOUNT.toLocaleString()
        );

        user.hist.push(
            "[" + getDateTime() + "] Salário recebido: $" +
            SALARY_AMOUNT.toLocaleString()
        );

        saveBank(db);

        alert(
            "Você recebeu $" +
            SALARY_AMOUNT.toLocaleString()
        );
    }
}

// Sessão automática
window.onload = function(){

    let session = getSession();

    if(session){

        let db = getBank();

        if(db[session]){

            currentUser = session;

            document
            .getElementById("loginScreen")
            .classList.add("hidden");

            document
            .getElementById("appScreen")
            .classList.remove("hidden");

            loadDashboard();
        }
    }
};

// ======================
// BANCO CAPITAL PRO
// PARTE 3 (FINAL)
// ======================

// Transferência por número de conta
function transferir(){

    let contaDestino =
        document.getElementById("contaDestino").value;

    let valor =
        Number(
            document.getElementById("valorTransferencia").value
        );

    let db = getBank();

    let sender = db[currentUser];

    let receiverName = null;

    // procurar usuário pela conta
    for(let user in db){

        if(db[user].conta === contaDestino){
            receiverName = user;
            break;
        }
    }

    if(!receiverName){
        alert("Conta não encontrada!");
        return;
    }

    if(sender.saldo < valor){
        alert("Saldo insuficiente!");
        return;
    }

    sender.saldo -= valor;
    db[receiverName].saldo += valor;

    addHistory(
        currentUser,
        "Transferiu $" + valor + " para " + receiverName
    );

    addHistory(
        receiverName,
        "Recebeu $" + valor + " de " + currentUser
    );

    db[receiverName].notifications.push(
        "💸 Você recebeu $" + valor + " de " + currentUser
    );

    saveBank(db);

    loadDashboard();

    alert("Transferência realizada!");
}

// Empréstimo
function emprestimo(){

    let valor =
        Number(
            document.getElementById("valorEmprestimo").value
        );

    let db = getBank();

    db[currentUser].saldo += valor;

    db[currentUser].emprestimo += valor;

    addHistory(
        currentUser,
        "Empréstimo recebido: $" + valor
    );

    saveBank(db);

    loadDashboard();

    alert("Empréstimo aprovado!");
}

// Poupança
function guardarPoupanca(){

    let valor =
        Number(
            document.getElementById("valorPoupanca").value
        );

    let db = getBank();

    if(db[currentUser].saldo < valor){
        alert("Saldo insuficiente!");
        return;
    }

    db[currentUser].saldo -= valor;

    db[currentUser].poupanca += valor;

    addHistory(
        currentUser,
        "Guardou na poupança: $" + valor
    );

    saveBank(db);

    loadDashboard();

    alert("Valor guardado na poupança!");
}

// Atualização automática do sistema
setInterval(() => {

    if(currentUser){
        loadDashboard();
    }

}, 5000);
