import { Vec2 } from "./vec";

export function getPointerClickInClipSpace(
    canvas: HTMLCanvasElement,
    e: PointerEvent
): Vec2 {
    const rect = canvas.getBoundingClientRect();
    
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
    
        // these are both 0-1
        x = x * canvas.width / canvas.clientWidth
        y = y * canvas.height / canvas.clientHeight
    
        // convert to webgl clip space
        x = x / canvas.width * 2 -1;
        y = y  / canvas.height * -2 + 1;

        return [x,y]
}