import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js';
import * as dat from 'dat.gui'
import * as TWEEN from '@tweenjs/tween.js'

const FOV = 75;
const NEAR = 0.1;
const FAR = 1000.0;
const CAMERAX = 0.0;
const CAMERAY = 0.6;
const CAMERAZ = 3.0;
const ROTATIONX = 0.0;
const ROTATIONY = 0.0;
const ROTATIONZ = 0.0;
const SCALEX = 1.0;
const SCALEY = 1.0;
const SCALEZ = 1.0;

const loader = new THREE.TextureLoader();
const circle = loader.load('./circle.png');

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Objects
//#region 
const geometryObject = {
    type: 'Torus'
};

const sphereObject = {
    radius: 1,
    widthSegments: 32,
    heightSegments: 32,
    phiStart: 0,
    phiLength: Math.PI * 2,
    thetaStart: 0,
    thetaLength: Math.PI
};

const cylinderObject = {
    radiusTop: 1,
    radiusBottom: 1,
    height: 3,
    radialSegments: 32,
    heightSegments: 32,
    openEnded: false,
    thetaStart: 0,
    thetaLength: Math.PI * 2
};

const coneObject = {
    radius: 1,
    height: 3,
    radialSegments: 32,
    heightSegments: 32,
    openEnded: false,
    thetaStart: 0,
    thetaLength: Math.PI * 2
};

const torusObject = {
    radius: 1,
    tube: 0.2,
    radialSegments: 16,
    tubularSegments: 100,
    arc: Math.PI * 2
};

const boxObject = {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1
};

const teapotObject = {
    size: 1,
    segments: 10,
    bottom: true,
    lid: true,
    body: true,
    fitLid: true,
    blinn: true
};
var geometry = new THREE.TorusGeometry( torusObject.radius, torusObject.tube, torusObject.radialSegments, torusObject.tubularSegments);
//#endregion

// Materials
//#region 
const materialObject = {
    type: 'Mesh Standard'
};

const mapInput = document.getElementById('mapInput');
mapInput.addEventListener('change', (event) => {

    var file = event.target.files[0];

    if (file.type.match( 'image.*')) 
    {
        var reader = new FileReader();
        reader.addEventListener( 'load', function (e) {
            var image = new Image();

            image.addEventListener('load', () => {
                var texture = new THREE.Texture(image);
                texture.sourceFile = file.name;
                texture.format = file.type === 'image/jpeg' ? THREE.RGBFormat : THREE.RGBAFormat;
				texture.needsUpdate = true;

                switch (materialObject.type)
                {
                    case 'Mesh Basic':
                        meshBasicMaterialObject.map = texture;
                        break;
                    case 'Mesh Standard':
                        meshStandardMaterialObject.map = texture;
                        break;
                    case 'Mesh Phong':
                        meshPhongMaterialObject.map = texture;
                        break;
                }
            });
            image.src = e.target.result;
            
        });
        reader.readAsDataURL(file);
    }
});

const meshBasicMaterialObject = {
    color: 0xffffff,
    map: null,
    applyMap: false,
    ChooseMap: () => {
        mapInput.click();
    },
    side: 'Front'
};

const meshStandardMaterialObject = {
    color: 0xffffff,
    map: null,
    applyMap: false,
    ChooseMap: () => {
        mapInput.click();
    },
    emissiveColor: 0x000000,
    side: 'Front'
};

const meshPhongMaterialObject = {
    color: 0xffffff,
    map: null,
    applyMap: false,
    ChooseMap: () => {
        mapInput.click();
    },
    specularColor: 0x111111,
    emissiveColor: 0x000000,
    side: 'Front'
};

const lineBasicMaterialObject = {
    color: 0xffffff,
    linewidth: 1,
    side: 'Front'
};

const pointsMaterialObject = {
    color: 0xffffff,
    size: 1,
    side: 'Front'
};

var material = new THREE.MeshStandardMaterial();
//material.size = 0.005;
//material.side = THREE.DoubleSide;
//material.map = circle;
//#endregion

// Mesh
//#region 
const meshObject = {
    mode: 'Solid'
};

var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const meshHelper = new THREE.BoxHelper(mesh, 0xffff00);
meshHelper.visible = true;
scene.add(meshHelper);
//#endregion

// Plane
//#region
const planeGeometry = new THREE.PlaneGeometry( 100, 100);
planeGeometry.rotateX( - Math.PI / 2 );
const planeMaterial = new THREE.ShadowMaterial( { opacity: 0.2} );

const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
scene.add(plane);

const gridHelper = new THREE.GridHelper( 100, 100 );
gridHelper.material.opacity = 0.25;
gridHelper.material.transparent = true;
const meshHelperObject = {
    visible: true
};
scene.add(gridHelper);
//#endregion

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
//#region 
const camera = new THREE.PerspectiveCamera(FOV, sizes.width / sizes.height, NEAR, FAR);
camera.position.set(CAMERAX, CAMERAY, CAMERAZ);
camera.rotation.set(ROTATIONX, ROTATIONY, ROTATIONZ);
camera.scale.set(SCALEX, SCALEY, SCALEZ);
scene.add(camera);

var cameraFolder = gui.addFolder('Camera');

var cameraPositionFolder = cameraFolder.addFolder('Position');
cameraPositionFolder.add(camera.position, 'x').step(0.01);
cameraPositionFolder.add(camera.position, 'y').step(0.01);
cameraPositionFolder.add(camera.position, 'z').step(0.01);
var cameraRotationFolder = cameraFolder.addFolder('Rotation');
cameraRotationFolder.add(camera.rotation, 'x').step(0.01).onChange(() => {
    camera.updateProjectionMatrix();
});
cameraRotationFolder.add(camera.rotation, 'y').step(0.01).onChange(() => {
    camera.updateProjectionMatrix();
    
});
cameraRotationFolder.add(camera.rotation, 'z').step(0.01).onChange(() => {
    camera.updateProjectionMatrix();
});
var cameraScaleFolder = cameraFolder.addFolder('Scale');
cameraScaleFolder.add(camera.scale, 'x').step(0.01);
cameraScaleFolder.add(camera.scale, 'y').step(0.01);
cameraScaleFolder.add(camera.scale, 'z').step(0.01);
cameraFolder.add(camera, 'fov').step(0.01).onChange(() => {
    camera.updateProjectionMatrix();
});
cameraFolder.add(camera, 'near').step(0.01).onChange(() => {
    camera.updateProjectionMatrix();
});
cameraFolder.add(camera, 'far').step(0.01).onChange(() => {
    camera.updateProjectionMatrix();
});
const cameraObject = {
    type: 'Perspective',
    reset: () => {
        camera.position.set(CAMERAX, CAMERAY, CAMERAZ);
        camera.rotation.set(ROTATIONX, ROTATIONY, ROTATIONZ);
        camera.scale.set(SCALEX, SCALEY, SCALEZ);
        camera.fov = FOV;
        camera.near = NEAR;
        camera.far = FAR;
        camera.updateProjectionMatrix();
        cameraFolder.updateDisplay();
    }
};
cameraFolder.add(cameraObject, 'type', ['Perspective']);
cameraFolder.add(cameraObject, 'reset');
//#endregion


// Lights
//#region 
// Point Light 1
const pointLight1Color = {
    color: 0xffffff
};
const pointLight1 = new THREE.PointLight(pointLight1Color.color);
pointLight1.castShadow = true;
pointLight1.shadow.mapSize.width = 2048;
pointLight1.shadow.mapSize.height = 2048;
pointLight1.position.x = 2;
pointLight1.position.y = 3;
pointLight1.position.z = 4;
pointLight1.visible = true;
scene.add(pointLight1);
const pointLightHelper1 = new THREE.PointLightHelper(pointLight1, 0.5);
pointLightHelper1.visible = true;
scene.add(pointLightHelper1);

// Point Light 2
const pointLight2Color = {
    color: 0xffffff
};
const pointLight2 = new THREE.PointLight(pointLight2Color.color);
pointLight2.castShadow = true;
pointLight2.shadow.mapSize.width = 2048;
pointLight2.shadow.mapSize.height = 2048;
pointLight2.position.x = -2;
pointLight2.position.y = 3;
pointLight2.position.z = -4;
pointLight2.visible = false;
scene.add(pointLight2);
const pointLightHelper2 = new THREE.PointLightHelper(pointLight2, 0.5);
pointLightHelper2.visible = false;
scene.add(pointLightHelper2);

// Point Light 3
const pointLight3Color = {
    color: 0xffffff
};
const pointLight3 = new THREE.PointLight(pointLight3Color.color);
pointLight3.castShadow = true;
pointLight3.shadow.mapSize.width = 2048;
pointLight3.shadow.mapSize.height = 2048;
pointLight3.position.x = -2;
pointLight3.position.y = 3;
pointLight3.position.z = 4;
pointLight3.visible = false;
scene.add(pointLight3);
const pointLightHelper3 = new THREE.PointLightHelper(pointLight3, 0.5);
pointLightHelper3.visible = false;
scene.add(pointLightHelper3);

// Ambient Light
const ambientLightColor = {
    color: 0x404040
};
const ambientLight = new THREE.AmbientLight(ambientLightColor.color);
ambientLight.visible = false;
scene.add(ambientLight);
var lightFolder = gui.addFolder('Lights');

var pointLight1Folder = lightFolder.addFolder('Point light 1');
var pointLight1PositionFolder = pointLight1Folder.addFolder('Position');
pointLight1PositionFolder.add(pointLight1.position, 'x').step(0.01);
pointLight1PositionFolder.add(pointLight1.position, 'y').step(0.01);
pointLight1PositionFolder.add(pointLight1.position, 'z').step(0.01);
pointLight1Folder.addColor(pointLight1Color, 'color').onChange(() => {
    pointLight1.color.set(pointLight1Color.color);
    pointLightHelper1.update();
});
pointLight1Folder.add(pointLight1, 'intensity').min(0).max(10).step(0.1);
pointLight1Folder.add(pointLightHelper1, 'visible').name('helper');
pointLight1Folder.add(pointLight1, 'castShadow').name('cast shadow');
pointLight1Folder.add(pointLight1, 'visible').name('enabled');

var pointLight2Folder = lightFolder.addFolder('Point light 2');
var pointLight2PositionFolder = pointLight2Folder.addFolder('Position');
pointLight2PositionFolder.add(pointLight2.position, 'x').step(0.01);
pointLight2PositionFolder.add(pointLight2.position, 'y').step(0.01);
pointLight2PositionFolder.add(pointLight2.position, 'z').step(0.01);
pointLight2Folder.addColor(pointLight2Color, 'color').onChange(() => {
    pointLight2.color.set(pointLight2Color.color);
    pointLightHelper2.update();
});
pointLight2Folder.add(pointLight2, 'intensity').min(0).max(10).step(0.1);
pointLight2Folder.add(pointLightHelper2, 'visible').name('helper');
pointLight2Folder.add(pointLight2, 'castShadow').name('cast shadow');
pointLight2Folder.add(pointLight2, 'visible').name('enabled');

var pointLight3Folder = lightFolder.addFolder('Point light 3');
var pointLight3PositionFolder = pointLight3Folder.addFolder('Position');
pointLight3PositionFolder.add(pointLight3.position, 'x').step(0.01);
pointLight3PositionFolder.add(pointLight3.position, 'y').step(0.01);
pointLight3PositionFolder.add(pointLight3.position, 'z').step(0.01);
pointLight3Folder.addColor(pointLight3Color, 'color').onChange(() => {
    pointLight3.color.set(pointLight3Color.color);
    pointLightHelper3.update();
});
pointLight3Folder.add(pointLight3, 'intensity').min(0).max(10).step(0.1);
pointLight3Folder.add(pointLightHelper3, 'visible').name('helper');
pointLight3Folder.add(pointLight3, 'castShadow').name('cast shadow');
pointLight3Folder.add(pointLight3, 'visible').name('enabled');

var ambientLightFolder = lightFolder.addFolder('Ambient light');
ambientLightFolder.addColor(ambientLightColor, 'color').onChange(() => {
    ambientLight.color.set(ambientLightColor.color);
});
ambientLightFolder.add(ambientLight, 'intensity').min(0).max(10).step(0.1);
ambientLightFolder.add(ambientLight, 'visible').name('enabled');
//#endregion

// Controls
//#region 
const cameraControl = new OrbitControls(camera, canvas);
cameraControl.update();
var isDragging = false;
cameraControl.addEventListener('change', (value) => {
    cameraFolder.updateDisplay();
    isDragging = true;
});

const transformControl = new TransformControls(camera, canvas);
transformControl.addEventListener( 'dragging-changed', (event) => 
{
    cameraControl.enabled = !event.value;
});


transformControl.attach(mesh);
scene.add(transformControl);
//#endregion


// Nav function
//#region
const transformNav = document.getElementById('transform');
transformNav.style.backgroundColor = '#35ffff';
const rotateNav = document.getElementById('rotate');
const scaleNav = document.getElementById('scale');
const detachNav = document.getElementById('detach');

function transformNavOnClick()
{
    transformNav.style.backgroundColor = '#35ffff';
    rotateNav.style.backgroundColor = '#d1d1d1';
    scaleNav.style.backgroundColor = '#d1d1d1';
    detachNav.style.backgroundColor = '#d1d1d1';
    transformControl.attach(mesh);
    transformControl.setMode( "translate" );
}

function rotateNavOnClick()
{
    transformNav.style.backgroundColor = '#d1d1d1';
    rotateNav.style.backgroundColor = '#35ffff';
    scaleNav.style.backgroundColor = '#d1d1d1';
    detachNav.style.backgroundColor = '#d1d1d1';
    transformControl.attach(mesh);
    transformControl.setMode( "rotate" );
}

function scaleNavOnClick()
{
    transformNav.style.backgroundColor = '#d1d1d1';
    rotateNav.style.backgroundColor = '#d1d1d1';
    scaleNav.style.backgroundColor = '#35ffff';
    detachNav.style.backgroundColor = '#d1d1d1';
    transformControl.attach(mesh);
    transformControl.setMode( "scale" );
}

function detachNavOnClick()
{
    transformNav.style.backgroundColor = '#d1d1d1';
    rotateNav.style.backgroundColor = '#d1d1d1';
    scaleNav.style.backgroundColor = '#d1d1d1';
    detachNav.style.backgroundColor = '#35ffff';
    transformControl.detach();
}

transformNav.addEventListener('click', transformNavOnClick);
rotateNav.addEventListener('click', rotateNavOnClick);
scaleNav.addEventListener('click', scaleNavOnClick);
detachNav.addEventListener('click', detachNavOnClick);
//#endregion

window.addEventListener("keydown", (event) => 
{
    switch (event.key)
    {
        case 'w':
            transformNavOnClick();
            break;
        case 'e':
            rotateNavOnClick();
            break;
        case 'r':
            scaleNavOnClick();
            break;
        case 't':
            detachNavOnClick();
            break;
    }
});

// Raycaster
//#region 
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
var onMesh = true;
canvas.addEventListener('pointerdown', (event) => {
    if (!transformControl.dragging)
    {
        if (event.button == 0)
        {
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            raycaster.setFromCamera( mouse, camera);

            const intersects = raycaster.intersectObjects(scene.children);
            if ( intersects.length > 0 )
            {
                for (let index = 0; index < intersects.length; index++)
                {
                    onMesh = false;
                    if ( intersects[index].object == mesh)
                    {
                        transformControl.attach(mesh);
                        if (meshHelperObject.visible)
                        {
                            meshHelper.visible = true;
                        }
                        onMesh = true;
                        break;
                    }
                    else if (intersects[index].object == pointLightHelper1)
                    {
                        transformControl.attach(pointLight1);
                        onMesh = true;
                        break;
                    }
                    else if (intersects[index].object == pointLightHelper2)
                    {
                        transformControl.attach(pointLight2);
                        onMesh = true;
                        break;
                    }
                    else if (intersects[index].object == pointLightHelper3)
                    {
                        transformControl.attach(pointLight3);
                        onMesh = true;
                        break;
                    }
                }
            } 
        }
    }
});

cameraControl.addEventListener('end', (value) => {
    if (!isDragging)
    {
        if (!onMesh)
        {
            transformControl.detach();
            if (meshHelperObject.visible)
            {
                meshHelper.visible = false;
            }
        }
    }
    else
    {
        isDragging = false;
    }
});
//#endregion

// Mesh folder
//#region 
var meshFolder = gui.addFolder('Mesh');
meshFolder.add(meshObject, 'mode', ['Solid', 'Line', 'Point']).name('Draw mode').onChange(ChangeDrawMode);
var objectFolder = meshFolder.addFolder('Object');
var objectPositionFolder = objectFolder.addFolder('Position');

var objectRotationFolder = objectFolder.addFolder('Rotation');

var objectScaleFolder = objectFolder.addFolder('Scale');

CreateObjectFolder();

var geometryFolder = meshFolder.addFolder('Geometry');
geometryFolder.add(geometryObject, 'type', ['Sphere', 'Cylinder', 'Cone', 'Box', 'Torus', 'Teapot']).onChange(CreateNewGeometry);
geometryFolder.add(torusObject, 'radius').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
geometryFolder.add(torusObject, 'tube').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
geometryFolder.add(torusObject, 'radialSegments').min(2).max(30).step(1).onChange(AdjustGeometry);
geometryFolder.add(torusObject, 'tubularSegments').min(3).max(200).step(1).onChange(AdjustGeometry);
geometryFolder.add(torusObject, 'arc').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);

var materialFolder = meshFolder.addFolder('Material');
materialFolder.add(materialObject, 'type', ['Mesh Basic', 'Mesh Standard', 'Mesh Phong']).onChange(CreateNewMaterial);
CreateMeshStandardMaterialUI();

//#endregion

transformControl.addEventListener('change', () => 
{
    UpdateMeshHelper();
    objectFolder.updateDisplay();
});

function UpdateMeshHelper() {
    if (meshHelperObject.visible)
    {
        if (meshHelper.visible)
        {
            meshHelper.update();
        }
    }
}


//Renderer
//#region 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.needsUpdate = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const renderObject = {
    clearColor: 0x24282a,
    alpha: 1,
    fog: '',
    fogColor: 0xffffff
};
renderer.setClearColor(renderObject.clearColor, renderObject.alpha);
var environmentFolder = gui.addFolder('Environment');
environmentFolder.addColor(renderObject, 'clearColor').name('bground color').onChange(() => {
    renderer.setClearColor(renderObject.clearColor, renderObject.alpha);
});

environmentFolder.add(renderObject, 'alpha').name('alpha').min(0).max(1).step(0.01).onChange(() => {
    renderer.setClearColor(renderObject.clearColor, renderObject.alpha);
});
environmentFolder.add(renderObject, 'fog', ['', 'Linear', 'Exponential']).onChange((value) => {
    switch (value) 
    {
        case '':
            scene.fog = null;
            for (var i = environmentFolder.__controllers.length - 1; i > 2; i--)
            {
                environmentFolder.__controllers[i].remove();
            }
            break;
        case 'Linear':
            scene.fog = new THREE.Fog(renderObject.fogColor, 1, 100);
            for (var i = environmentFolder.__controllers.length - 1; i > 2; i--)
            {
                environmentFolder.__controllers[i].remove();
            }
            environmentFolder.addColor(renderObject, 'fogColor').name('fog color').onChange(() => {
                scene.fog.color.set(renderObject.fogColor);
            });
            environmentFolder.add(scene.fog, 'near').min(0).step(0.01);
            environmentFolder.add(scene.fog, 'far').min(0).step(0.01);
            break;
        case 'Exponential':
            scene.fog = new THREE.FogExp2(renderObject.fogColor, 0.0005);
            for (var i = environmentFolder.__controllers.length - 1; i > 2; i--)
            {
                environmentFolder.__controllers[i].remove();
            }
            environmentFolder.addColor(renderObject, 'fogColor').name('fog color').onChange(() => {
                scene.fog.color.set(renderObject.fogColor);
            });
            environmentFolder.add(scene.fog, 'density').min(0).max(0.1).step(0.001);
            break;
    }
});
//#endregion

// Animations
// Animation 1

const animation1 = [];
TWEEN.removeAll();
CreateAnimation1();

function CreateAnimation1() {

    animation1[0] = new TWEEN.Tween(mesh.material).to({opacity: 1}, 500)
    .onUpdate(function() {
        materialFolder.updateDisplay();
    }).onStart(function() {
        mesh.material.transparent = true;
    });
    
    animation1[1] = new TWEEN.Tween(mesh.rotation).to({y: Math.PI * 2}, 1500).easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(function() {
        objectFolder.updateDisplay();
        UpdateMeshHelper();
    });
    
    animation1[2] = new TWEEN.Tween(mesh.material).to({opacity: 0}, 500).onUpdate(function() {
        materialFolder.updateDisplay();
    });

    animation1[0].chain(animation1[1]);
    animation1[1].chain(animation1[2]);
    animation1[2].chain(animation1[0]);
}

// Animation 2
const animation2_a = [];
const animation2_b = [];
CreateAnimation2();


function CreateAnimation2() {
    animation2_a[0] = new TWEEN.Tween(mesh.position).to({y: 15}).easing(TWEEN.Easing.Bounce.In).onUpdate(function() {
        objectFolder.updateDisplay();
        UpdateMeshHelper();
    });
    animation2_a[1] = new TWEEN.Tween(mesh.position).to({y: 0}).easing(TWEEN.Easing.Bounce.Out).onUpdate(function() {
        objectFolder.updateDisplay();
        UpdateMeshHelper();
    });
    animation2_a[0].chain(animation2_a[1]);
    animation2_a[1].chain(animation2_a[0]);

    animation2_b[0] = new TWEEN.Tween(camera.position).to({z: 16}, 1000).easing(TWEEN.Easing.Quadratic.Out).onUpdate(function() {
        cameraFolder.updateDisplay();
    });
    animation2_b[1] = new TWEEN.Tween(camera.position).to({x: [-16, 0], z: [0, -16]}, 6000).easing(TWEEN.Easing.Cubic.InOut).interpolation(TWEEN.Interpolation.Bezier).onUpdate(function() {
        cameraFolder.updateDisplay();
    });
    animation2_b[2] = new TWEEN.Tween(camera.position).to({x: [16, 0], z: [0, 16]}, 6000).easing(TWEEN.Easing.Quintic.InOut).interpolation(TWEEN.Interpolation.Bezier).onUpdate(function() {
        cameraFolder.updateDisplay();
    });
    animation2_b[3] = new TWEEN.Tween(camera.position).to({z: 3.0}, 1000).easing(TWEEN.Easing.Quadratic.In).onComplete(function() {
        animation2_a[0].stopChainedTweens();
        animationObject.isPlaying = false;
    }).onUpdate(function() {
        cameraFolder.updateDisplay();
    });
    animation2_b[0].chain(animation2_b[1]);
    animation2_b[1].chain(animation2_b[2]);
    animation2_b[2].chain(animation2_b[3]);
}

const animationObject = {
    isPlaying: false,
    animation1: PlayAnimation1,

    animation2: PlayAnimation2,

    stop: function () {
        animationObject.isPlaying = false;
        animation1[0].stopChainedTweens();
        animation2_a[0].stopChainedTweens();
        animation2_b[0].stopChainedTweens();
    },

    pause: function () {
        var tweens = TWEEN.getAll();

        for (var i = 0; i < tweens.length; i++)
        {
            tweens[i].pause();
        }
    }

};

function PlayAnimation1() {
    if (!animationObject.isPlaying)
    {
        animationObject.isPlaying = true;
        mesh.material.opacity = 0;
        animation1[0].start();
    }
    else
    {
        for (var i = 0; i < animation1.length; i++)
        {
            if (animation1[i].isPaused)
            {
                animation1[i].resume();
            }
        }
    }
}

function PlayAnimation2() {
    if (!animationObject.isPlaying)
    {
        animationObject.isPlaying = true;
        animation2_a[0].start();
        animation2_b[0].start();
    }
    else
    {
        for (var i = 0; i < animation2_a.length; i++)
        {
            if (animation2_a[i].isPaused)
            {
                animation2_a[i].resume();
            }
        }

        for (var i = 0; i < animation2_b.length; i++)
        {
            if (animation2_b[i].isPaused)
            {
                animation2_b[i].resume();
            }
        }
    }
}

var animationFolder = gui.addFolder('Animation');
animationFolder.add(animationObject, 'animation1').name('animation 1');
animationFolder.add(animationObject, 'animation2').name('animation 2');
animationFolder.add(animationObject, 'pause');
animationFolder.add(animationObject, 'stop');

//#endregion

const tick = () =>
{

    // Update objects
    // Update Orbital Controls
    if (animationObject.isPlaying)
    {
        for (var i = 0; i < animation2_b.length; i++)
        {
            if (animation2_b[i].isPlaying)
            {
                cameraControl.update();
            }
        }
    }

    TWEEN.update();
    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();

function AdjustGeometry()
{
    switch (geometryObject.type)
    {
        case 'Sphere':
            mesh.geometry = new THREE.SphereGeometry(
                sphereObject.radius, 
                sphereObject.widthSegments, 
                sphereObject.heightSegments, 
                sphereObject.phiStart,
                sphereObject.phiLength,
                sphereObject.thetaStart,
                sphereObject.thetaLength);
            break;
        case 'Cylinder':
            mesh.geometry = new THREE.CylinderGeometry(
                cylinderObject.radiusTop,
                cylinderObject.radiusBottom,
                cylinderObject.height,
                cylinderObject.radialSegments,
                cylinderObject.heightSegments,
                cylinderObject.openEnded,
                cylinderObject.thetaStart,
                cylinderObject.thetaLength
            );
            break;
        case 'Cone':
            mesh.geometry = new THREE.ConeGeometry(
                coneObject.radius,
                coneObject.height,
                coneObject.radialSegments,
                coneObject.heightSegments,
                coneObject.openEnded,
                coneObject.thetaStart,
                coneObject.thetaLength
            );
            break;
        case 'Box':
            mesh.geometry = new THREE.BoxGeometry(
                boxObject.width,
                boxObject.height,
                boxObject.depth,
                boxObject.widthSegments,
                boxObject.heightSegments,
                boxObject.depthSegments
            );
            break;
        case 'Torus':
            mesh.geometry = new THREE.TorusGeometry(
                torusObject.radius, 
                torusObject.tube, 
                torusObject.radialSegments, 
                torusObject.tubularSegments,
                torusObject.arc);
            break;
        case 'Teapot':
            mesh.geometry = new TeapotGeometry(
                teapotObject.size,
                teapotObject.segments,
                teapotObject.bottom,
                teapotObject.lid,
                teapotObject.body,
                teapotObject.fitLid,
                teapotObject.blinn
            );
            break;
    }
    meshHelper.update();
}

function CreateNewGeometry()
{
    for (var i = geometryFolder.__controllers.length - 1; i > 0; --i)
    {
        geometryFolder.__controllers[i].remove();
    }

    switch (geometryObject.type)
    {
        case 'Sphere':
            mesh.geometry = new THREE.SphereGeometry(sphereObject.radius, sphereObject.widthSegments, sphereObject.heightSegments);
            geometryFolder.add(sphereObject, 'radius').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(sphereObject, 'widthSegments').min(3).max(32).step(1).onChange(AdjustGeometry);
            geometryFolder.add(sphereObject, 'heightSegments').min(2).max(32).step(1).onChange(AdjustGeometry);
            geometryFolder.add(sphereObject, 'phiStart').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(sphereObject, 'phiLength').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(sphereObject, 'thetaStart').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(sphereObject, 'thetaLength').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);
            break;
        case 'Cylinder':
            mesh.geometry = new THREE.CylinderGeometry(cylinderObject.radiusTop, cylinderObject.radiusBottom, cylinderObject.height, cylinderObject.radialSegments, cylinderObject.heightSegments);
            geometryFolder.add(cylinderObject, 'radiusTop').min(0).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(cylinderObject, 'radiusBottom').min(0).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(cylinderObject, 'height').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(cylinderObject, 'radialSegments').min(3).max(64).step(1).onChange(AdjustGeometry);
            geometryFolder.add(cylinderObject, 'heightSegments').min(1).max(64).step(1).onChange(AdjustGeometry);
            geometryFolder.add(cylinderObject, 'openEnded').onChange(AdjustGeometry);
            geometryFolder.add(cylinderObject, 'thetaStart').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(cylinderObject, 'thetaLength').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);
            break;
        case 'Cone':
            mesh.geometry = new THREE.ConeGeometry(coneObject.radius, cylinderObject.height, coneObject.radialSegments, coneObject.heightSegments);
            geometryFolder.add(coneObject, 'radius').min(0).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(coneObject, 'height').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(coneObject, 'radialSegments').min(3).max(64).step(1).onChange(AdjustGeometry);
            geometryFolder.add(coneObject, 'heightSegments').min(1).max(64).step(1).onChange(AdjustGeometry);
            geometryFolder.add(coneObject, 'openEnded').onChange(AdjustGeometry);
            geometryFolder.add(coneObject, 'thetaStart').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(coneObject, 'thetaLength').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);
            break;
        case 'Box':
            mesh.geometry = new THREE.BoxGeometry();
            geometryFolder.add(boxObject, 'width').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(boxObject, 'height').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(boxObject, 'depth').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(boxObject, 'widthSegments').min(1).max(10).step(1).onChange(AdjustGeometry);
            geometryFolder.add(boxObject, 'heightSegments').min(1).max(10).step(1).onChange(AdjustGeometry);
            geometryFolder.add(boxObject, 'depthSegments').min(1).max(10).step(1).onChange(AdjustGeometry);
            break;
        case 'Torus':
            mesh.geometry = new THREE.TorusGeometry( torusObject.radius, torusObject.tube, torusObject.radialSegments, torusObject.tubularSegments);
            geometryFolder.add(torusObject, 'radius').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(torusObject, 'tube').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(torusObject, 'radialSegments').min(2).max(30).step(1).onChange(AdjustGeometry);
            geometryFolder.add(torusObject, 'tubularSegments').min(3).max(200).step(1).onChange(AdjustGeometry);
            geometryFolder.add(torusObject, 'arc').min(0).max(Math.PI * 2).step(0.1).onChange(AdjustGeometry);
            break;
        case 'Teapot':
            mesh.geometry = new TeapotGeometry(teapotObject.size);
            geometryFolder.add(teapotObject, 'size').min(0.1).max(10).step(0.1).onChange(AdjustGeometry);
            geometryFolder.add(teapotObject, 'segments').min(2).max(50).step(1).onChange(AdjustGeometry);
            geometryFolder.add(teapotObject, 'bottom').onChange(AdjustGeometry);
            geometryFolder.add(teapotObject, 'lid').onChange(AdjustGeometry);
            geometryFolder.add(teapotObject, 'body').onChange(AdjustGeometry);
            geometryFolder.add(teapotObject, 'fitLid').onChange(AdjustGeometry);
            geometryFolder.add(teapotObject, 'blinn').onChange(AdjustGeometry);
            break;
    }
    meshHelper.update();
}

function CreateNewMaterial()
{
    for (var i = materialFolder.__controllers.length - 1; i > 0; --i)
    {
        materialFolder.__controllers[i].remove();
    }

    switch (materialObject.type)
    {
        case 'Mesh Basic':
            mesh.material = new THREE.MeshBasicMaterial();
            CreateMeshBasicMaterialUI();
            break;
        case 'Mesh Standard':
            mesh.material = new THREE.MeshStandardMaterial();
            CreateMeshStandardMaterialUI();
            break;
        case 'Mesh Phong':
            mesh.material = new THREE.MeshPhongMaterial();
            CreateMeshPhongMaterialUI();
            break;
    }
    meshHelper.update();
}

function CreateMeshBasicMaterialUI() {
    materialFolder.addColor(meshBasicMaterialObject, 'color').onChange(() => { 
        mesh.material.color.set(meshBasicMaterialObject.color);
    });
    materialFolder.add(mesh.material, 'vertexColors').name('vertex colors').onChange(() => {
        mesh.material.needsUpdate = true;
    });
    materialFolder.add(meshBasicMaterialObject, 'applyMap').name('apply map').onChange((value) => {
        mesh.material.map = value ? meshBasicMaterialObject.map : null;
        mesh.material.needsUpdate = true;
    });
    materialFolder.add(meshBasicMaterialObject, 'ChooseMap').name('choose map');
    materialFolder.add(meshBasicMaterialObject, 'side', ['Front', 'Back', 'Double']).onChange((value) => {
        switch (value)
        {
            case 'Front':
                mesh.material.side = THREE.FrontSide;
                break;
            case 'Back':
                mesh.material.side = THREE.BackSide;
                break;
            case 'Double':
                mesh.material.side = THREE.DoubleSide;
                break;
        }
    });
    materialFolder.add(mesh.material, 'transparent');
    materialFolder.add(mesh.material, 'opacity').min(0).max(1.0).step(0.01);
    materialFolder.add(mesh.material, 'depthTest').name('depth test');
    materialFolder.add(mesh.material, 'depthWrite').name('depth write');
    materialFolder.add(mesh.material, 'wireframe');
    materialFolder.add(mesh.material, 'visible');
}

function CreateMeshStandardMaterialUI() {
    materialFolder.addColor(meshStandardMaterialObject, 'color').onChange(() => { 
        mesh.material.color.set(meshStandardMaterialObject.color);
    });
    materialFolder.add(mesh.material, 'vertexColors').name('vertex colors').onChange(() => {
        mesh.material.needsUpdate = true;
    });
    materialFolder.add(mesh.material, 'roughness').min(0).max(1.0).step(0.01);
    materialFolder.add(mesh.material, 'metalness').min(0).max(1.0).step(0.01);
    materialFolder.addColor(meshStandardMaterialObject, 'emissiveColor').name('emissive').onChange(() => { 
        mesh.material.emissive.set(meshStandardMaterialObject.emissiveColor);
    });
    materialFolder.add(meshStandardMaterialObject, 'applyMap').name('apply map').onChange((value) => {
        mesh.material.map = value ? meshStandardMaterialObject.map : null;
        mesh.material.needsUpdate = true;
    });
    materialFolder.add(meshStandardMaterialObject, 'ChooseMap').name('choose map');
    materialFolder.add(meshStandardMaterialObject, 'side', ['Front', 'Back', 'Double']).onChange((value) => {
        switch (value)
        {
            case 'Front':
                mesh.material.side = THREE.FrontSide;
                break;
            case 'Back':
                mesh.material.side = THREE.BackSide;
                break;
            case 'Double':
                mesh.material.side = THREE.DoubleSide;
                break;
        }
    });
    materialFolder.add(mesh.material, 'flatShading').name('flat shading').onChange(() => {
        mesh.material.needsUpdate = true;
    });
    materialFolder.add(mesh.material, 'transparent');
    materialFolder.add(mesh.material, 'opacity').min(0).max(1.0).step(0.01);
    materialFolder.add(mesh.material, 'depthTest').name('depth test');
    materialFolder.add(mesh.material, 'depthWrite').name('depth write');
    materialFolder.add(mesh.material, 'wireframe');
    materialFolder.add(mesh.material, 'visible');
}

function CreateMeshPhongMaterialUI() {
    materialFolder.addColor(meshPhongMaterialObject, 'color').onChange(() => { 
        mesh.material.color.set(meshPhongMaterialObject.color);
    });
    materialFolder.add(mesh.material, 'vertexColors').name('vertex colors').onChange(() => {
        mesh.material.needsUpdate = true;
    });
    materialFolder.addColor(meshPhongMaterialObject, 'specularColor').name('specular').onChange(() => { 
        mesh.material.specular.set(meshPhongMaterialObject.specularColor);
    });
    materialFolder.add(mesh.material, 'shininess').min(0).max(100).step(1);
    materialFolder.addColor(meshPhongMaterialObject, 'emissiveColor').name('emissive').onChange(() => { 
        mesh.material.emissive.set(meshPhongMaterialObject.emissiveColor);
    });
    materialFolder.add(meshPhongMaterialObject, 'applyMap').name('apply map').onChange((value) => {
        mesh.material.map = value ? meshPhongMaterialObject.map : null;
        mesh.material.needsUpdate = true;
    });
    materialFolder.add(meshPhongMaterialObject, 'ChooseMap').name('choose map');
    materialFolder.add(meshPhongMaterialObject, 'side', ['Front', 'Back', 'Double']).onChange((value) => {
        switch (value)
        {
            case 'Front':
                mesh.material.side = THREE.FrontSide;
                break;
            case 'Back':
                mesh.material.side = THREE.BackSide;
                break;
            case 'Double':
                mesh.material.side = THREE.DoubleSide;
                break;
        }
    });
    materialFolder.add(mesh.material, 'flatShading').name('flat shading').onChange(() => {
        mesh.material.needsUpdate = true;
    });
    materialFolder.add(mesh.material, 'transparent');
    materialFolder.add(mesh.material, 'opacity').min(0).max(1.0).step(0.01);
    materialFolder.add(mesh.material, 'depthTest').name('depth test');
    materialFolder.add(mesh.material, 'depthWrite').name('depth write');
    materialFolder.add(mesh.material, 'wireframe');
    materialFolder.add(mesh.material, 'visible');
}

function CreateLineBasicMaterialUI() {
    materialFolder.addColor(lineBasicMaterialObject, 'color').onChange(() => { 
        mesh.material.color.set(lineBasicMaterialObject.color);
    });
    materialFolder.add(mesh.material, 'linewidth').name('line witdh').min(1).max(1);
    materialFolder.add(mesh.material, 'vertexColors').name('vertex colors').onChange(() => {
        mesh.material.needsUpdate = true;
    });
    materialFolder.add(lineBasicMaterialObject, 'side', ['Front', 'Back', 'Double']).onChange((value) => {
        switch (value)
        {
            case 'Front':
                mesh.material.side = THREE.FrontSide;
                break;
            case 'Back':
                mesh.material.side = THREE.BackSide;
                break;
            case 'Double':
                mesh.material.side = THREE.DoubleSide;
                break;
        }
    });
    materialFolder.add(mesh.material, 'transparent');
    materialFolder.add(mesh.material, 'opacity').min(0).max(1.0).step(0.01);
    materialFolder.add(mesh.material, 'depthTest').name('depth test');
    materialFolder.add(mesh.material, 'depthWrite').name('depth write');
    materialFolder.add(mesh.material, 'visible');
}

function CreatePointsMaterialUI() {
    materialFolder.addColor(pointsMaterialObject, 'color').onChange(() => { 
        mesh.material.color.set(pointsMaterialObject.color);
    });
    materialFolder.add(mesh.material, 'size').min(0.001).max(0.01).step(0.001);
    materialFolder.add(mesh.material, 'sizeAttenuation');
    materialFolder.add(mesh.material, 'vertexColors').name('vertex colors').onChange(() => {
        mesh.material.needsUpdate = true;
    });
    materialFolder.add(pointsMaterialObject, 'side', ['Front', 'Back', 'Double']).onChange((value) => {
        switch (value)
        {
            case 'Front':
                mesh.material.side = THREE.FrontSide;
                break;
            case 'Back':
                mesh.material.side = THREE.BackSide;
                break;
            case 'Double':
                mesh.material.side = THREE.DoubleSide;
                break;
        }
    });
    materialFolder.add(mesh.material, 'transparent');
    materialFolder.add(mesh.material, 'opacity').min(0).max(1.0).step(0.01);
    materialFolder.add(mesh.material, 'depthTest').name('depth test');
    materialFolder.add(mesh.material, 'depthWrite').name('depth write');
    materialFolder.add(mesh.material, 'visible');
}

function ChangeDrawMode(value) {
    if (!animationObject.isPlaying)
    {
        scene.remove(mesh);
        transformControl.detach();
        switch (value)
        {
            case 'Solid':
                mesh = new THREE.Mesh(mesh.geometry, new THREE.MeshStandardMaterial());
                scene.add(mesh);
                meshHelper.setFromObject(mesh);
                meshHelperObject.visible = true;
                meshHelper.visible = true;
                meshHelper.update();
                if (onMesh)
                {
                    transformControl.attach(mesh);
                }
                for (var i = materialFolder.__controllers.length - 1; i >= 0; --i) {
                    materialFolder.__controllers[i].remove();
                }
                materialObject.type = 'Mesh Standard';
                materialFolder.add(materialObject, 'type', ['Mesh Basic', 'Mesh Standard', 'Mesh Phong']).onChange(CreateNewMaterial);
                CreateMeshStandardMaterialUI();
                break;
            case 'Line':
                mesh = new THREE.LineSegments(mesh.geometry, new THREE.LineBasicMaterial());
                scene.add(mesh);
                meshHelperObject.visible = false;
                meshHelper.visible = false;
                meshHelper.update();
                if (onMesh)
                {
                    transformControl.attach(mesh);
                }

                for (var i = materialFolder.__controllers.length - 1; i >= 0; --i) {
                    materialFolder.__controllers[i].remove();
                }
                materialObject.type = 'Line Basic';
                materialFolder.add(materialObject, 'type', ['Line Basic']);
                CreateLineBasicMaterialUI();
                break;
            case 'Point':
                mesh = new THREE.Points(mesh.geometry, new THREE.PointsMaterial({map: circle, size: 0.003}));
                scene.add(mesh);
                meshHelper.setFromObject(mesh);
                meshHelperObject.visible = false;
                meshHelper.visible = false;
                meshHelper.update();
                if (onMesh)
                {
                    transformControl.attach(mesh);
                }
                for (var i = materialFolder.__controllers.length - 1; i >= 0; --i) {
                    materialFolder.__controllers[i].remove();
                }
                materialObject.type = 'Points';
                materialFolder.add(materialObject, 'type', ['Points']);
                CreatePointsMaterialUI();
                break;
        }
        CreateObjectFolder();
        TWEEN.removeAll();
        CreateAnimation1();
        CreateAnimation2();
        gui.updateDisplay();
    }
}

function CreateObjectFolder() {

    for (var i = objectPositionFolder.__controllers.length - 1; i >= 0; --i)
    {
        objectPositionFolder.__controllers[i].remove();
    }
    objectPositionFolder.add(mesh.position, 'x').step(0.01).onChange(UpdateMeshHelper);
    objectPositionFolder.add(mesh.position, 'y').step(0.01).onChange(UpdateMeshHelper);
    objectPositionFolder.add(mesh.position, 'z').step(0.01).onChange(UpdateMeshHelper);

    for (var i = objectRotationFolder.__controllers.length - 1; i >= 0; --i)
    {
        objectRotationFolder.__controllers[i].remove();
    }
    objectRotationFolder.add(mesh.rotation, 'x').step(0.01).onChange(UpdateMeshHelper);
    objectRotationFolder.add(mesh.rotation, 'y').step(0.01).onChange(UpdateMeshHelper);
    objectRotationFolder.add(mesh.rotation, 'z').step(0.01).onChange(UpdateMeshHelper);

    for (var i = objectScaleFolder.__controllers.length - 1; i >= 0; --i)
    {
        objectScaleFolder.__controllers[i].remove();
    }
    objectScaleFolder.add(mesh.scale, 'x').step(0.01).onChange(UpdateMeshHelper);
    objectScaleFolder.add(mesh.scale, 'y').step(0.01).onChange(UpdateMeshHelper);
    objectScaleFolder.add(mesh.scale, 'z').step(0.01).onChange(UpdateMeshHelper);


    for (var i = objectFolder.__controllers.length - 1; i >= 0; --i)
    {
        objectFolder.__controllers[i].remove();
    }
    objectFolder.add(mesh, 'castShadow').name('cast shadow');
    objectFolder.add(mesh, 'receiveShadow').name('receive shadow');
    objectFolder.add(mesh, 'visible');
    objectFolder.add(meshHelperObject, 'visible').name('helper').onChange(() => {

        if (meshObject.mode != 'Solid')
        {
            meshHelperObject.visible = false;
        }
        else
        {
            if (!meshHelperObject.visible)
            {
                meshHelper.visible = false;
            }
            else
            {
                meshHelper.visible = onMesh;
                meshHelper.update();
            }
        }
    });
}