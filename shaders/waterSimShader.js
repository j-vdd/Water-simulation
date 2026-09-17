"strict mode"
let waterSimShader;
function loadWaterSimShader() {
    waterSimShader = new ShaderProgramClass(
        `
        void main(void) {
            
        }
        `,
        `
        uniform sampler2D uSampler;

        void main(void) {
            
        }
        `
    );
}