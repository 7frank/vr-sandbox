/*
The MIT License (MIT)

Copyright (c) 2014 Felix Palmer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import terrainVert from './shaders/terrain.vert';
import terrainFrag from './shaders/terrain.frag';

export
function createTerrainMaterial (heightData, width, height, globalOffset, offset, scale, resolution, edgeMorph) {
  // Is it bad to change this for every tile?

  // FIXME not working in the current scope
  //   terrainVert.define('TILE_RESOLUTION', resolution.toFixed(1));

  return new THREE.ShaderMaterial(
    { extensions: {derivatives: true},
      uniforms:
            {
              uHeight:
                    {
                      type: 'f',
                      value: height// .toFixed(1)
                    },
              uWidth:
                    {
                      type: 'f',
                      value: width// .toFixed(1)
                    },
              TILE_RESOLUTION:
                {
                  type: 'f',
                  value: resolution// .toFixed(1)
                },
              uEdgeMorph:
               {
                 type: 'i',
                 value: edgeMorph
               },
              uGlobalOffset:
               {
                 type: 'v3',
                 value: globalOffset
               },
              uHeightData:
               {
                 type: 't',
                 value: heightData
               },
              uTileOffset:
               {
                 type: 'v2',
                 value: offset
               },
              uScale:
               {
                 type: 'f',
                 value: scale
               }
            },
      vertexShader: terrainVert({}),
      fragmentShader: terrainFrag({})
    });
}
