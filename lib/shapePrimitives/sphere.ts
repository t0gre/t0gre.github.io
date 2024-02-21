import { Vertices } from "../mesh";

export function createSphereVertices(
    radius: number,
    subdivisionsAxis: number,
    subdivisionsHeight: number,
    opt_startLatitudeInRadians?: number,
    opt_endLatitudeInRadians?: number,
    opt_startLongitudeInRadians?: number,
    opt_endLongitudeInRadians?: number): Vertices {
  if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
    throw new Error('subdivisionAxis and subdivisionHeight must be > 0');
  }

  opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
  opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
  opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
  opt_endLongitudeInRadians = opt_endLongitudeInRadians || (Math.PI * 2);

  const latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
  const longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

  // We are going to generate our sphere by iterating through its
  // spherical coordinates and generating 2 triangles for each quad on a
  // ring of the sphere.
  const numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
  
  const positionDimensions = 3;
  const normalDimensions = 3;
  const texDimensions = 2;
  const positions = new Float32Array(positionDimensions * numVertices);
  const normals   = new Float32Array(normalDimensions * numVertices);
  const texcoords = new Float32Array(texDimensions * numVertices);
  /// TODO implement cursor
  let [positionCursor, normalCursor, texcoordCursor] = [0, 0, 0, 0];
     

  // Generate the individual vertices in our vertex buffer.
  for (let y = 0; y <= subdivisionsHeight; y++) {
    for (let x = 0; x <= subdivisionsAxis; x++) {

      
      // Generate a vertex based on its spherical coordinates
      const u = x / subdivisionsAxis;
      const v = y / subdivisionsHeight;
      const theta = longRange * u + opt_startLongitudeInRadians;
      const phi = latRange * v + opt_startLatitudeInRadians;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const ux = cosTheta * sinPhi;
      const uy = cosPhi;
      const uz = sinTheta * sinPhi;

      
      positions[positionCursor++] = radius * ux;
      positions[positionCursor++] = radius * uy;
      positions[positionCursor++] = radius * uz;
     
      normals[normalCursor++] = ux; 
      normals[normalCursor++] = uy;
      normals[normalCursor++] = uz;

      texcoords[texcoordCursor++] = 1 - u;
      texcoords[texcoordCursor++] = v;

      
    }
  }

  const numVertsAround = subdivisionsAxis + 1;
  const indices = new Uint16Array(3 * subdivisionsAxis * subdivisionsHeight * 2);

  let indicesCursor = 0;

  for (let x = 0; x < subdivisionsAxis; x++) {  // eslint-disable-line
    for (let y = 0; y < subdivisionsHeight; y++) {  // eslint-disable-line
      // Make triangle 1 of quad.
      indices[indicesCursor++] = (y + 0) * numVertsAround + x;
      indices[indicesCursor++] = (y + 0) * numVertsAround + x + 1;
      indices[indicesCursor++] = (y + 0) *  (y + 1) * numVertsAround + x;
      
         

      // Make triangle 2 of quad.
      indices[indicesCursor++] = (y + 1) * numVertsAround + x;
      indices[indicesCursor++] = (y + 0) * numVertsAround + x + 1;
      indices[indicesCursor++] = (y + 1) * numVertsAround + x + 1;
    }
  }

  return {
    positions,
    normals,
    texcoords,
    indices,
  };
}