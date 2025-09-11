import glm from "@devzolo/node-native-glm";
import { Camera } from "utils";
export declare class Renderer2D {
    static beginScene(camera: Camera, transform: glm.mat4): void;
    static endScene(): void;
    static flush(): void;
    static drawQuad(position: glm.vec2, size: glm.vec2, color: glm.vec4): void;
}
//# sourceMappingURL=Renderer2D.d.ts.map