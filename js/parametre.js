export default class Parametre {

    constructor(scene, canvas) {
        this.scene = scene;
        this.canvas = canvas;

        // On récupère les div du document
        this.divFps = document.getElementById("fps");
        this.divFullScreen = document.getElementById("fullScreen");
        this.settings = document.getElementById("settingsPanel");
        this.divHome = document.getElementById("home");

        // Volume et lumonosité
        this.inputVolume = document.getElementById("volume");
        this.inputLuminosite = document.getElementById("luminosite");
        this.volume = 0.5;
        this.luminosite = 10; 

        // Sensibilité
        this.inputSensibiliteX = document.getElementById("sensibiliteX");
        this.inputSensibiliteY = document.getElementById("sensibiliteY");
        this.sensibiliteX = 2000;
        this.sensibiliteY = 2000;
        
        // Si le mode plei écran est activé
        this.divFullScreen.enable = false;

        // Ajout de listener
        this.#listenerLockPointer();
        this.#listenerFullScreen();
        this.#listenerSettings();
        this.#listenerHome();
    }

    updateParametre(fps) {
        this.showFps(fps);

        // Check du volume
        let newVolume = this.inputVolume.value / 100;
        if (newVolume != this.volume) {
            BABYLON.Engine.audioEngine.setGlobalVolume(newVolume);
        }

        // Check de la luminosité
        let newLuminosite = this.inputLuminosite.value * 20 / 100;
        if (newLuminosite != this.luminosite) {
            this.scene.getLightByName("Sun").intensity = newLuminosite;
        }

        // Check de la sensibilité
        let newSensibiliteX = this.inputSensibiliteX.value * 100;
        let newSensibiliteY = this.inputSensibiliteY.value * 100;
        if (newSensibiliteX != this.sensibiliteX) {
            this.scene.getCameraByName("TankRotateCamera").angularSensibilityY = newSensibiliteX;
        }
        if (newSensibiliteY != this.sensibiliteY) {
            this.scene.getCameraByName("TankRotateCamera").angularSensibilityX = newSensibiliteY;
        }
    }



    // Actualise l'affichage des fps
    showFps(fps) {
        this.divFps.innerHTML = fps + " fps";
    }


    // Ajout de listener pour vérrouiller la souris dans le jeu
    #listenerLockPointer() {
        this.scene.onPointerDown = () => {
            if (!this.scene.alreadyLocked) {
                this.canvas.requestPointerLock();
            }
        }

        document.addEventListener("pointerlockchange", () => {
            let element = document.pointerLockElement || null;
            if (element) {
                this.scene.alreadyLocked = true;
            }
            else {
                this.scene.alreadyLocked = false;
            }
        })
    }

    // Ajout de onClick pour activer ou désactiver le mode plein écran
    #listenerFullScreen() {
        this.divFullScreen.onclick = () => {
            if (document.body.requestFullscreen) {
                if (this.divFullScreen.enable == "undefined" || !this.divFullScreen.enable) {
                    document.body.requestFullscreen();
                    this.divFullScreen.enable = true;
                    this.divFullScreen.setAttribute("id", "minimisedScreen");
                }
                else {
                    document.exitFullscreen();
                    this.divFullScreen.enable = false;
                    this.divFullScreen.setAttribute("id", "fullScreen");
                }
            }
        }
    }

    #listenerSettings() {
        let camera = this.scene.getCameraByName("TankRotateCamera");

        // Bouton pour ouvrir les paramètres
        let divSettings = document.getElementById("settings");
        divSettings.onclick = () => {
            if (divSettings.enable == "undefined" || !divSettings.enable) {
                this.settings.style.display = "block";
                divSettings.enable = true;
                camera.detachControl(this.canvas);
            }
            else {
                this.settings.style.display = "none";
                divSettings.enable = false;
                camera.attachControl(this.canvas, false);
            }
        }
        // Bouton pour fermer les paramètres
        let closeButtonSettings = document.getElementById("closeButtonSettings");
        closeButtonSettings.onclick = () => {
            this.settings.style.display = "none";
            divSettings.enable = false;
            camera.attachControl(this.canvas, false);
        }

        let buttonControle = document.getElementById("buttonControle");
        let buttonOption = document.getElementById("buttonOption");
        let selectedButton = document.getElementById("buttonSelected");
        let divControle = document.getElementById("divControle");
        let divOption = document.getElementById("divOption");

        buttonControle.onclick = () => {
            buttonControle.style.color = "#158EC6";
            buttonOption.style.color = "#E9E4C6";
            selectedButton.style.float = "none";
            divControle.style.display = "block";
            divOption.style.display = "none";
        }

        buttonOption.onclick = () => {
            buttonControle.style.color = "#E9E4C6";
            buttonOption.style.color = "#158EC6";
            selectedButton.style.float = "right";
            divControle.style.display = "none";
            divOption.style.display = "block";
        }
    }

    #listenerHome() {
        this.divHome.onclick = () => {
            this.scene.dispose();
            let divGame = document.getElementById("GAME").style.display = "none";
            let divHome = document.getElementById("HOME").style.display = "block";
        }
    }
}