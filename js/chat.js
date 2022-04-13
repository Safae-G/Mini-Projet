import {listOfPlayers, setListOfPlayers, startGame} from "./jeu.js"


let username;
let socket;

let nbClientUpdateSeconde = 10;


document.addEventListener("DOMContentLoaded", async function() {
    let divButton = document.getElementById("buttonPlay");
    divButton.onclick = async () => {
        let user = document.getElementById("username");
        if (user.value != "") {
            if (user.value.length <= 16) {
                let divHome = document.getElementById("HOME").style.display = "none";
                let divGame = document.getElementById("GAME").style.display = "block";
                username = user.value;
                init();
            }
            else {
                alert("Votre nom d'utilisateur ne doit pas comporter plus de 16 caractères");
            }
        }
        else {
            alert("Veuillez saisir votre nom d'utilisateur")
        }
    }
}, false);



async function init() {
    // Initialise le socket
    socket = io.connect();

    // Récupération des div
    let users = document.getElementById("users");


    // Connection
    socket.on('connect', () => {
        socket.emit("adduser", username);
    });

    // Liste des joueurs
    socket.on('updateusers', (listOfUsers) => {
        users.innerHTML = "";
        for (let player in listOfUsers) {
            let userLineHTML = "<span class=\"listJoueur\">" + listOfUsers[player] + "</span><br><br>";
            users.innerHTML += userLineHTML;
        }
    });

    // Nouvelle positions des joueurs
    socket.on('updatePlayers', (newListOfPlayers) => {
        setListOfPlayers(newListOfPlayers);
    });

    // Position de départ des joueur
    socket.on('posDepart', async (listOfPlayersDepart) => {
        await startGame("renderCanvas", username, listOfPlayersDepart);
    });

    // Mise à jour du client
    setInterval(() => {
        if (username != undefined && listOfPlayers[username] != undefined) {
            socket.emit("updateClient", listOfPlayers[username]);
        }
    }, 1000 / nbClientUpdateSeconde);
}