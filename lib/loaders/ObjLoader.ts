import { Vertices } from "../mesh";

function parseOBJ(text: string): Vertices {
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // same order as `f` indices
  const objVertexData = [
    objPositions,
    objTexcoords,
    objNormals,
  ];

  // same order as `f` indices
  let webglVertexData: [[], [], []] = [
    [],   // positions
    [],   // texcoords
    [],   // normals
  ];

  
  // vert is of the for 'a/b/c'
  function addVertex(vert: string) {
    const ptn: [string, string, string] = vert.split('/') as [string, string, string];
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i]!.length);
      // safe since i will never be bigger than 2
      // @ts-ignore
      webglVertexData[i]!.push(...objVertexData[i]![index]);
    });
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
        objPositions.push(parts.map(parseFloat));
        break;
      case 'vn':
        objNormals.push(parts.map(parseFloat));
        break;
      case 'vt':
        objTexcoords.push(parts.map(parseFloat));
        break;
      case 'f':
        const numTriangles = parts.length - 2;
        for (let tri = 0; tri < numTriangles; ++tri) {

          // @ts-ignore
          addVertex(parts[0]);
          // @ts-ignore
          addVertex(parts[tri + 1]);
          // @ts-ignore
          addVertex(parts[tri + 2]);
        }
        break;
    } ;
    
  }

  return {
    positions: new Float32Array(webglVertexData[0]) ,
    texcoords: new Float32Array(webglVertexData[1]),
    normals: new Float32Array(webglVertexData[2]),
  };
}

export async function loadObj(path: string): Promise<Vertices> {
    const response = await fetch(path);
    const text = await response.text();
    return parseOBJ(text)
}