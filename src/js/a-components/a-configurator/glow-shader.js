
import { FPSCtrl} from '../../utils/fps-utils';

const vertexShader = `
uniform vec3 viewVector;
uniform float c;
uniform float p;
varying float intensity;
void main() 
{
    vec3 vNormal = normalize( normalMatrix * normal );
	vec3 vNormel = normalize( normalMatrix * viewVector );
	intensity = pow( c - dot(vNormal, vNormel), p );
	
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform vec3 glowColor;
varying float intensity;
void main() 
{
	vec3 glow = glowColor * intensity;
    gl_FragColor = vec4( glow, 1.0 );
}
`;
/*
"uniform mat4 modelMatrix;",
"uniform mat4 modelViewMatrix;",
"uniform mat4 projectionMatrix;",
"uniform mat4 viewMatrix;",
"uniform mat3 normalMatrix;",
"uniform vec3 cameraPosition;",

 */
const vertexShaderOutline = `
uniform       vec4    light_POSITION_01;                                                                                                        
uniform       mat4    mvpMatrix;                                                                                               
                                                                                                                 
uniform       mat4    lightMatrix;                                                                                                              
                                                                                                                                                                                                      
//attribute     vec2    texture;                                                                                                                  

varying       vec3    normalPass;                                                                                                                                                  
//varying       vec2    varTexcoord;                                                                                                              
   

void main()                                                                                                                                          
{                                                                                                                                                    

    normalPass             = (modelViewMatrix *  vec4(normal, 1.0)).xyz; //there is no non-uniform scaling so modelView should be fine                                                                        

  //  varTexcoord            = texture;                                                                                                                

   // gl_Position            = mvpMatrix * position;                                                                                                   

    gl_Position            =projectionMatrix* modelViewMatrix   * vec4(position, 1.0) ;        

}
`;

const fragmentShaderOutline = `
//uniform   sampler2D  Texture1;                                                                                                                                                 

uniform   vec4       light_POSITION_01;                                                                                                        

varying   vec2       varTexcoord;                                                                                                                                              
varying   vec3       normalPass;                                                                                                                                                  

          float      NdotL1;                                                                                                                                                   


 void main()                                                                                                                                                                      
 {                                                                                                                                                                                

    NdotL1                    =  dot(normalize(normalPass), light_POSITION_01.xyz);                                                                                                             

    if(NdotL1 > 0.5)                                                                      
    {                                                                                        
          gl_FragColor        =  vec4(1.0); //REPLACE THIS LINE WITH THE COLOR OUTPUT OF YOUR SHADER                                     
    }                                                                                     
    else if(NdotL1 > 0.2)                                                                 
    {                                                                                        
          gl_FragColor        =  vec4(0.43*.7, 0.4*.7, 0.31*.7, 1.0);                    
    }                                                                                     
    else                                                                                  
    {                                                                                     
          gl_FragColor        =   vec4(0.43*.3, 0.4*.3, 0.31*.3, 1.0);                    
    }                                                                                     


 }

`;

/*

var sphereGeom = new THREE.SphereGeometry(100, 32, 16);

var moonTexture = THREE.ImageUtils.loadTexture( 'images/moon.jpg' );
var moonMaterial = new THREE.MeshBasicMaterial( { map: moonTexture } );
var moon = new THREE.Mesh(sphereGeom, moonMaterial);
moon.position.set(150,0,-150);
scene.add(moon);
*/

// create custom material from the shader code above
//   that is within specially labeled script tags
export
function createCustomGlowMaterial () {
  return new THREE.ShaderMaterial(
    {
      uniforms:
            {
              'c': { type: 'f', value: 1.0 },
              'p': { type: 'f', value: 3 },
              glowColor: { type: 'c', value: new THREE.Color(0xffff00) },
              viewVector: { type: 'v3', value: new THREE.Vector3() }

            },
      vertexShader,
      fragmentShader,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
}

export
function createCustomOutlineMaterial (cameraPos) {
  return new THREE.ShaderMaterial(
    {
      uniforms:
                {
                  // TODO for outline shader
                  light_POSITION_01: { type: 'v4', value: new THREE.Vector4() },
                  //  mvpMatrix: { type: 'mat4', value: new THREE.Matrix4() },
                  // modelView: { type: 'mat4', value: new THREE.Matrix4() },
                  lightMatrix: { type: 'mat4', value: new THREE.Matrix4() }

                },
      vertexShader: vertexShaderOutline,
      fragmentShader: fragmentShaderOutline
      // side: THREE.FrontSide,
      // blending: THREE.AdditiveBlending,
      // transparent: true
    });
}

var glowMaterial, glowMaterialScript;
/**
 * FIXME glow-shader does not incorporate camera rotation
 * Note only one material instance
 * @param origMesh
 * @param cameraPos the initial camera position. Override 'material.uniforms.viewVector' if the camera vector is replaced
 * @returns {{mesh: THREE.Mesh, material}}
 */
export
function createGlowForMesh (origMesh, actorMesh, cameraMesh) {
  if (!glowMaterial) {
    glowMaterial = createCustomGlowMaterial();// createCustomOutlineMaterial(cameraPos);//
    glowMaterialScript = new FPSCtrl(20, function () {
      glowMaterial.uniforms.viewVector.value = cameraMesh.getWorldPosition().sub(actorMesh.getWorldPosition()).normalize();
    }).start();
  }

  var glowMesh = window.ooo = new THREE.Mesh(origMesh.geometry.clone(), glowMaterial);

  glowMesh.scale.multiplyScalar(1.05);
  return {mesh: glowMesh, material: glowMaterial};
}
