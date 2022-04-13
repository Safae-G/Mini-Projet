export async function loadMap(scene) {


    const result = await BABYLON.SceneLoader.ImportMeshAsync(null, "./assets/models/", "map.glb", scene);
    let map = result.meshes[0];

    
    map.position = new BABYLON.Vector3(0, 0, 0);

    let allMeshes = map.getChildMeshes();
    allMeshes.forEach(m => {
        //m.receiveShadows = true;
        m.checkCollisions = true;
    });

    scene.getMeshByName("sea").material.needDepthPrePass = true;
    scene.getLightByName("Sun").intensity = 10;
    

    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);
};