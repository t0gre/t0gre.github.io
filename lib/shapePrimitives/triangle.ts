import { Vertices } from "../mesh";

// Fill the buffer with the values that define a single triangle.
export function createTriangleVertices(): Vertices {
    const positions = new Float32Array([
            // left corner
            -30,   0,  0,
            // top
            0, 200,  0,
            // right corner
            30,   0,  0,
            
        ]);
  
  
    const normals = new Float32Array([
            // left
            -0.2, 0, 0,
            // top
            0, 0.2, 0,
            // right
            0.2, 0, 0,
           
        ]);
    return {
        positions,
        normals
    }
  }