import {modulo} from "./utilitaire.js"

export default class ufo {

    async build(scene, canvas, posDepart) {
        // La game, la scene, et le canvas
        this.scene = scene;
        this.canvas = canvas;

        // Information sur la position et rotation du ufo sur la map
        this.infoTank = posDepart;

        // Récupération des div html
        this.divlife = document.getElementById("life");
        this.divlifeBar = document.getElementById("lifeBar");

        // Axe de mouvement X et Z
        this.axisMovement = [false, false, false, false, false];
        this.#addListenerMovement();

        // Vitesse de déplacement du tank
        this.speed = 0.6;

        // Vie du tank
        this.life = 100;

        // On crée le tank avec la caméra qui le suit et le viseur
        await this.#createufo(scene);
        this.camera = this.#createCamera(scene);
        this.#createCrosshair(scene);

        //let camera = new BABYLON.FreeCamera("free", new BABYLON.Vector3(30, 20, -10), scene);
        //camera.attachControl(canvas);

        // On prépare les armes
        await this.#prepareWeapons(scene);
    }


    checkActionTank(deltaTime) {
        // Déplace le joueur (le ufo)
        this.#checkMoveTank(deltaTime);

        // Rotation de la tourelle
        this.#checkMoveTourelle(deltaTime);

        // Anime le ufo en fonction des ses déplacement
        this.#animateTank();

        // Check des armes du tank
        this.#checkWeapons();

        // Met à jour la position du tank pour envoyer au server 
        this.#updatePosTank();
    }

    // Crée le ufo
    async #createTank(scene) {
        // Le "patron" du personnage
        const patronTank = BABYLON.MeshBuilder.CreateBox("patronPlayer", { width: 5, depth: 5, height: 3.5 }, scene);
        patronufo.isVisible = false;
        patronufo.checkCollisions = true;
        patronufo.position = new BABYLON.Vector3(this.infoTank.x, this.infoTank.y, this.infoTank.z);
        //patronufo.ellipsoid = new BABYLON.Vector3(3.6, 2, 3.6);
        patronufo.ellipsoid = new BABYLON.Vector3(1, 1.5, 1);
        patronufo.ellipsoidOffset = new BABYLON.Vector3(0, 1.5, 0);
        patronufo.bakeTransformIntoVertices(BABYLON.Matrix.Translation(0, 1.5, 0));
    
        // On importe le tank
        const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "./assets/models/", "ufo.glb", scene);
        var ufo = result.meshes[0];

        let allMeshes = ufo.getChildMeshes();
        allMeshes.forEach(m => {
            if (m.name == "Cann") {
                m.rotation = m.rotationQuaternion.toEulerAngles();
                this.meshCannon = m;
            }
            if (m.name == "Tour") {
                m.rotation = m.rotationQuaternion.toEulerAngles();
                this.meshTourelle = m;
            }
            m.metadata = "ufo";
        });

        // On récupère les mesh du cannon et de la tourelle (pour tirer et déplacer la tourelle)
        //this.meshCannon = this.scene.getMeshByName("Cannon");
        //this.meshTourelle = this.scene.getMeshByName("Tourelle");
        this.meshCannon.rotateY = 0;

        // On défini le patron comme parent au tank
        ufo.parent = patronufo;

        // Importation des animations
        this.animRun = result.animationGroups[0];
        this.animRun.stop();

        this.tank = patronTank;
    }


    // Crée une caméra qui suit la target
    #createCamera(scene) {        
        let camera = new BABYLON.ArcRotateCamera("ufoRotateCamera", -Math.PI/2, 1.1, 25, this.meshTourelle.absolutePosition, scene);
        camera.angularSensibilityX = 2000;
        camera.angularSensibilityY = 2000;

        camera.upperBetaLimit = Math.PI / 2.3;
        camera.lowerBetaLimit = Math.PI / 3;

        camera.upperRadiusLimit = 30;
        camera.lowerRadiusLimit = 15;
        //camera.inputs.attachInput(camera.inputs.attached.mouse);
        camera.attachControl(this.canvas, false);

        scene.activeCamera = camera;
        return camera;
    }

    // Permet au joueur de déplacer le ufo
    #checkMoveufo(deltaTime) {
        let fps = 1000 / deltaTime;
        let relativeSpeed = this.speed / (fps / 60);            // Vitesse de déplacement
        let rotationSpeed = 0.05;                               // Vitesse de rotation
        
        if (this.axisMovement[0]) {
            let forward = new BABYLON.Vector3(
                parseFloat(Math.sin(parseFloat(this.ufo.rotation.y))) * relativeSpeed, 
                0, 
                parseFloat(Math.cos(parseFloat(this.ufo.rotation.y))) * relativeSpeed
            );
            this.ufo.moveWithCollisions(forward);
        }
        if (this.axisMovement[1]) {
            let backward = new BABYLON.Vector3(
                parseFloat(-Math.sin(parseFloat(this.ufo.rotation.y))) * relativeSpeed, 
                0, 
                parseFloat(-Math.cos(parseFloat(this.ufo.rotation.y))) * relativeSpeed
            );
            this.ufo.moveWithCollisions(backward);
        }
        if (this.axisMovement[2]) {
            this.ufo.rotation.y += rotationSpeed;
            this.meshCannon.rotateY += rotationSpeed;
        }
        if (this.axisMovement[3]) {
            this.ufo.rotation.y -= rotationSpeed;
            this.meshCannon.rotateY -= rotationSpeed;
        }
        this.ufo.moveWithCollisions(new BABYLON.Vector3(0, (-1.5) * relativeSpeed, 0));
    }
 



    #updatePosufo() {
        // Position
        this.infoufo.x = this.ufo.position.x;
        this.infoufo.y = this.ufo.position.y;
        this.infoufo.z = this.ufo.position.z;

        // Rotation
        this.infoufo.rx = this.ufo.rotation.x;
        this.infoufo.ry = this.ufo.rotation.y;
        this.infoufo.rz = this.ufo.rotation.z;


        // Vie du ufo
        this.infoufo.life = this.life;

        // Si le ufo tire
        this.infoufo.fire = false;
        if (this.tireEnable === false) {
            this.infoTank.fire = true;
        }
    }


    #updateLife() {
        if (this.life >= 0) {
            this.divlife.innerHTML = this.life + "/100";

            let newImage = Math.trunc(this.life * 20 / 100);
            if (newImage >=10 && newImage <= 20)
                this.divlifeBar.style.backgroundImage = "url(/public/assets/images/lifeBar/lifeBar_" + newImage + ".png)";
            else if(newImage >= 0 && newImage < 10)
                this.divlifeBar.style.backgroundImage = "url(/public/assets/images/lifeBar/lifeBar_0" + newImage + ".png)";
        }
    }

    // Animation du ufo
    #animate() {
        // Animation de déplacement
        if (this.axisMovement[0] || this.axisMovement[1] ||
            this.axisMovement[2] || this.axisMovement[3]) {
            this.animRun.play(this.animRun.loopAnimation);
        }
        else {
            this.animRun.stop();
            this.animRun.reset();
        }
    }


    #createCrosshair(scene) {
        var crosshairMat = new BABYLON.StandardMaterial("crosshairMat", scene);
        crosshairMat.diffuseColor = new BABYLON.Color3(90, 88, 85);
        crosshairMat.emissiveColor = new BABYLON.Color3(90, 88, 85);
        crosshairMat.specularColor = new BABYLON.Color3(90, 88, 85);

        // Viseur qui suit la caméra
        this.crosshairCameraVertical = BABYLON.MeshBuilder.CreateBox("crossCamV", {height: .7, width: .06, depth: .01}, scene);
        this.crosshairCameraVertical.position = new BABYLON.Vector3(-0.1, 4, 20);
        this.crosshairCameraVertical.rotation.z = Math.PI / 2;
        this.crosshairCameraVertical.isPickable = false;
        this.crosshairCameraVertical.parent = this.camera;
        this.crosshairCameraVertical.material = crosshairMat;
        
        this.crosshairCameraHorizontal = BABYLON.MeshBuilder.CreateBox("crossCamH", {height: .7, width: .06, depth: .01}, scene);
        this.crosshairCameraHorizontal.position = new BABYLON.Vector3(-0.1, 4, 20);
        this.crosshairCameraHorizontal.isPickable = false;
        this.crosshairCameraHorizontal.parent = this.camera;
        this.crosshairCameraHorizontal.material = crosshairMat;


        // Provisoire
        var crosshairMat2 = new BABYLON.StandardMaterial("crosshairMat", scene);
        crosshairMat2.diffuseColor = new BABYLON.Color3.Blue();
        crosshairMat2.emissiveColor = new BABYLON.Color3.Blue();
        crosshairMat2.specularColor = new BABYLON.Color3.Blue();
        

        let posX = this.tank.position.x;
        let posY = this.tank.position.y;
        let posZ = this.tank.position.z;

        
        this.crosshairTourelle1 = BABYLON.MeshBuilder.CreateBox("crossTourelle1", {height: .5, width: .1, depth: .01}, scene);
        this.crosshairTourelle1.position = new BABYLON.Vector3(posX-1, posY+7.4, posZ+4.6);
        this.crosshairTourelle1.rotation.x = 0.3
        this.crosshairTourelle1.isVisible = true;
        this.crosshairTourelle1.isPickable = false;
        this.crosshairTourelle1.setParent(this.meshCannon);
        this.crosshairTourelle1.material = crosshairMat2;
        
        this.crosshairTourelle2 = BABYLON.MeshBuilder.CreateBox("Tourelle2", {height: .5, width: .1, depth: .01}, scene);
        this.crosshairTourelle2.position = new BABYLON.Vector3(posX-0.8, posY+7.7, posZ+4.6);
        this.crosshairTourelle2.rotation.z = Math.PI / 2;
        this.crosshairTourelle2.rotation.x = 0.3;
        this.crosshairTourelle2.isVisible = true;
        this.crosshairTourelle2.isPickable = false;
        this.crosshairTourelle2.setParent(this.meshCannon);
        this.crosshairTourelle2.material = crosshairMat2;

        this.crosshairTourelle3 = BABYLON.MeshBuilder.CreateBox("Tourelle3", {height: .5, width: .1, depth: .01}, scene);
        this.crosshairTourelle3.position = new BABYLON.Vector3(posX+0.6, posY+6.5, posZ+4.6);
        this.crosshairTourelle3.rotation.x = 0.3
        this.crosshairTourelle3.isVisible = true;
        this.crosshairTourelle3.isPickable = false;
        this.crosshairTourelle3.setParent(this.meshCannon);
        this.crosshairTourelle3.material = crosshairMat2;    
         
        this.crosshairTourelle4 = BABYLON.MeshBuilder.CreateBox("Tourelle4", {height: .5, width: .1, depth: .01}, scene);
        this.crosshairTourelle4.position = new BABYLON.Vector3(posX+0.4, posY+6.2, posZ+4.6);
        this.crosshairTourelle4.rotation.z = Math.PI / 2;
        this.crosshairTourelle4.rotation.x = 0.3;
        this.crosshairTourelle4.isVisible = true;
        this.crosshairTourelle4.isPickable = false;
        this.crosshairTourelle4.setParent(this.meshCannon);
        this.crosshairTourelle4.material = crosshairMat2;
    }


    // Prépare les armes
    async #prepareWeapons(scene) {
        // Boulet de cannon 
        var cannonBall = BABYLON.MeshBuilder.CreateSphere("cannonBall", {diameter: 1}, scene);
        var cannonBallMat = new BABYLON.StandardMaterial("cannonBallMaterial", scene);
        cannonBallMat.diffuseColor = BABYLON.Color3.Black();
        cannonBallMat.specularPower = 256;
        cannonBall.material = cannonBallMat;
        cannonBall.visibility = false;
        this.cannonBall = cannonBall;

        // Importation du bruit du coup de cannon
        this.cannonBlastSound = new BABYLON.Sound("bruitCannon", "./assets/sounds/cannonBlast.mp3", scene);

        // Zone invisible au-dessous la map qui détruit le boulet de cannon
        var killBox = BABYLON.MeshBuilder.CreateBox("killBox", {width:4000, depth:4000, height:4}, scene);
        killBox.position = new BABYLON.Vector3(0, -50, 0);
        killBox.visibility = 0;
        this.killBox = killBox;

        // Si le ufo peut tirer (1 tire puis 3sec d'attente)
        this.tireEnable = true;

        // Creation d'une box pour émettre les particule lors d'un tire 
        var particleEmitter = BABYLON.MeshBuilder.CreateBox("particleEmitter", {size: 0.05}, scene);
        particleEmitter.position = new BABYLON.Vector3(this.tank.position.x-0.1, this.tank.position.y+2.95, this.tank.position.z+4.6);
        particleEmitter.rotation.x = BABYLON.Tools.ToRadians(78.5);
        particleEmitter.isVisible = false;
        particleEmitter.setParent(this.meshCannon);
    
        // Création des particule
        const smokeBlast = await BABYLON.ParticleHelper.CreateFromSnippetAsync("LCBQ5Y#6", scene);
        smokeBlast.emitter = particleEmitter;
        smokeBlast.targetStopDuration = 0.2;
        smokeBlast.stop();
        this.smokeBlast = smokeBlast;

        // Div pour le nombre d'obus
        this.divNbObus = document.getElementById("nbObus");
    }

    // Permet au ufo de tirer
    #checkWeapons() {
        if (this.axisMovement[4] === true && this.tireEnable === true) {
            this.smokeBlast.start();    // Lance l'animation des particules
            var cannonBallClone = this.cannonBall.clone("cannonBallClone");
            cannonBallClone.visibility = 1;
            cannonBallClone.checkCollisions = false;
            cannonBallClone.position = this.meshCannon.absolutePosition;
            cannonBallClone.physicsImpostor = new BABYLON.PhysicsImpostor(cannonBallClone, BABYLON.PhysicsImpostor.SphereImpostor, {mass:2, friction:0.5, restitution:0}, this.scene);
            cannonBallClone.physicsImpostor.applyImpulse(this.meshCannon.up.scale(125), BABYLON.Vector3.Zero());
                            
            // Crée un gestionnaire d'action pour cannonBallClone
            cannonBallClone.actionManager = new BABYLON.ActionManager(this.scene);
            cannonBallClone.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    {
                        trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger,
                        parameter:this.killBox
                    }, 
                    function() {
                        cannonBallClone.dispose();
                    }
                )
            );
            this.cannonBlastSound.play();       // Joue le son du cannon

            // Met le tir a false et démare le timer
            this.tireEnable = false;
            this.divNbObus.innerHTML = "0";
            setTimeout(() => {
                this.tireEnable = true;
                this.divNbObus.innerHTML = "1";
            }, 3000);
        }
    }

    // Listener des touches
    #addListenerMovement() {
        window.addEventListener('keydown', (event) => {
            if ((event.key === "z") || (event.key === "Z")) {
                this.axisMovement[0] = true;
            } else if ((event.key === "s") || (event.key === "S")) {
                this.axisMovement[1] = true;
            } else if ((event.key === "d") || (event.key === "D")) {
                this.axisMovement[2] = true;
            } else if ((event.key === "q") || (event.key === "Q")) {
                this.axisMovement[3] = true;
            } else if (event.key === " ") {
                this.axisMovement[4] = true;
            }
        }, false);

        window.addEventListener('keyup', (event) => {
            if ((event.key === "z") || (event.key === "Z")) {
                this.axisMovement[0] = false;
            } else if ((event.key === "s") || (event.key === "S")) {
                this.axisMovement[1] = false;
            } else if ((event.key === "d") || (event.key === "D")) {
                this.axisMovement[2] = false;
            } else if ((event.key === "q") || (event.key === "Q")) {
                this.axisMovement[3] = false;
            } else if (event.key === " ") {
                this.axisMovement[4] = false;
            }
        }, false);
    }
}