export type GlState = {
    gl: WebGL2RenderingContext;
    vaos: Map<number, WebGLVertexArrayObject>;
    nextVaoId: number
}

export function initGlState(gl: WebGL2RenderingContext): GlState {
    return {
            gl,
            vaos: new Map<number, WebGLVertexArrayObject>(),
            nextVaoId: 0
        }
}
