import { Vertices } from "../mesh";

function parseOBJ(text: string): Vertices {
  

  // because indices are base 1 let's just fill in the 0th data
  const data = {
    positions: [[0, 0, 0]],
    texcoords: [[0, 0]],
    normals: [[0, 0, 0]],
  };

  // same order as `f` indices
  let webglVertexData: {
    positions: number[];
    texcoords: number[]
    normals: number[]
  } = {
    positions: [],
    texcoords: [],
    normals: [],
  }; 

  
  // f 1 2 3            # indices for positions only
  // f 1/1 2/2 3/3        # indices for positions and texcoords
  // f 1/1/1 2/2/2 3/3/3  # indices for positions, texcoords, and normals
  // f 1//1 2//2 3//3     # indices for positions and normals
  function addVertex(vert: string) {
    const ptn = vert.split('/');
    const positionIndex = parseInt(ptn[0]!)
    const positionValues = data.positions[positionIndex]! as [number, number, number];
    webglVertexData.positions.push(...positionValues)
    if (ptn.length == 2) {
      const texIndex = parseInt(ptn[1]!)
      const texValues = data.texcoords[texIndex]! as [number, number, number];
      webglVertexData.texcoords.push(...texValues)
    } else {
      if (ptn[1] === '') {  
        const normIndex = parseInt(ptn[2]!)
        const normValues = data.normals[normIndex]! as [number, number, number];
        webglVertexData.normals.push(...normValues)
      } else {
        const texIndex = parseInt(ptn[1]!)
        const texValues = data.texcoords[texIndex]! as [number, number, number];
        const normIndex = parseInt(ptn[2]!)
        const normValues = data.normals[normIndex]! as [number, number, number];
        webglVertexData.texcoords.push(...texValues)
        webglVertexData.normals.push(...normValues)
      }
    } 
  }
      


  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    // ignore comments
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    switch(keyword) {
      case 'v':
        data.positions.push(parts.map(parseFloat));
        break;
      case 'vn':
        data.normals.push(parts.map(parseFloat));
        break;
      case 'vt':
        data.texcoords.push(parts.map(parseFloat));
        break;
      case 'f':
        // this handles converting a face into triangles
        const numTriangles = parts.length - 2;
        for (let tri = 0; tri < numTriangles; ++tri) {

         
          addVertex(parts[0]!);
          addVertex(parts[tri + 1]!);
          addVertex(parts[tri + 2]!);
        }
        break;
    } ;
    
  }

  return {
    positions: new Float32Array(webglVertexData.positions) ,
    texcoords: new Float32Array(webglVertexData.texcoords),
    normals: new Float32Array(webglVertexData.normals),
  };
}

export async function loadObj(path: string): Promise<Vertices> {
    const response = await fetch(path);
    const text = await response.text();
    return parseOBJ(text)
}