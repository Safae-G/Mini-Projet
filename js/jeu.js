import ufo from "./ufo.js";
import {loadMap} from "./map.js";
import Parametre from "./parametre.js"
import Ennemi from "./ennemi.js";


let canvas;
let engine;
let scene;

let username;

let ennemis = {};
export let listOfPlayers;

export async function startGame(canvasId, user, listOfPlayersDepart) {
    // on stock l'username du joueur
    username = user;

    // Les informations de tous les joueur
    listOfPlayers = listOfPlayersDepart;

    // Canvas et Engine défini ici
    canvas = document.getElementById(canvasId);
    engine = new BABYLON.Engine(canvas, true);

    // Initialise la scene
    scene = createScene();

    // Activation de la physique
    scene.enablePhysics(new BABYLON.Vector3(0,-9.81, 0), new BABYLON.CannonJSPlugin());

    // On charge la map
    var map = await loadMap(scene);

    // On crée le tank (le joueur principale)
    let tank = new Tank();
    await tank.build(scene, canvas, listOfPlayers[username]);

    // On crée les autres joueurs (les ennemis)
    for (let player in listOfPlayers) {
        if (player != username) {
            let ennemi = new Ennemi();
            await ennemi.build(scene, canvas, player, listOfPlayers[player]);
            ennemis[player] = ennemi;
        }
    }

    // Initialise les paramètre (affichage des fps, jeu en pause, etc...)
    let parametre = new Parametre(scene, canvas);
    
    // Permet au jeu de tourner
    engine.runRenderLoop(async () => {
        // Actualisation des fps
        parametre.updateParametre(engine.getFps().toFixed());

        // Action du ufo (le joueur principale) et update de ses positions
        ufo.checkActionTank(engine.getDeltaTime());
        listOfPlayers[username] = ufo.infoTank;

        // Mise à jour de la position des autres joueurs
        for (let player in listOfPlayers) {
            if (player != username) {
                if (ennemis[player] === undefined) {
                    ennemis[player] = "";               // Pour ne pas en crée 2
                    let ennemi = new Ennemi();
                    await ennemi.build(scene, canvas, player, listOfPlayers[player]);
                    ennemis[player] = ennemi;
                }
                else {
                    if (ennemis[player] != undefined)
                        ennemis[player].update(listOfPlayers[player]);
                }
            }
        }

        // Supréssion des joueur déconnecté
        for (let player in ennemis) {
            if (!Object.keys(listOfPlayers).includes(player)) {
                ennemis[player].delete();
                delete ennemis[player];
            }
        }
        //console.log(Object.keys(ennemis));

        scene.render();
    });


    // Ajuste la vue 3D si le fenetre est agrandi ou diminué
    window.addEventListener("resize", function() {
        if (engine) {
            engine.resize();
        }
    }, false);
}

// Setter de ListOfPlayers
export function setListOfPlayers(newList) {
    listOfPlayers = newList;
}


// Initialise la scene
function createScene(engine) {
    let scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(4, 0.9, 0.9);
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    scene.collisionsEnabled = true;
    return scene;
}