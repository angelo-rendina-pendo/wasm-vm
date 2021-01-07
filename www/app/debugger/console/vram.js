// // monochrome
// byte = 15px
// 4 bytes = 60px = 1 row
// 64 rows = 64 * 4 bytes = 256 bytes
// last mem address = x7FFF = 32767
// vram = 32512..32767 = x7F00..x7FFF

// // chromatic
// byte = 3px with 5bit colour info = 3px with 32-colour palette
// 1 row = 60px = 20 bytes
// 64 row = 64 * 20 bytes = 1280 bytes
// vram = 31488..32767 = x7B00..x7FFF

const ROWS = 64;
const COLUMNS = 60;

export const COLOUR_MODE = {
    MONOCHROME: {
        name: 'MONOCHROME',
        vramAddress: 32512,
        pixelBits: 1
    }
}

export function getFrame(vm, modeName) {
    let pixels = [];
    switch (modeName) {
        case 'MONOCHROME':
            for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLUMNS; j++) {
                    const bitIndex = Math.floor(j % 15);
                    const wordIndex = COLOUR_MODE.MONOCHROME.vramAddress + i * 4 + Math.floor(j / 15);
                    const pixelMask = 1 << bitIndex;
                    const [lb, hb] = new Uint8Array(window.wasm.memory.buffer, vm.ram + wordIndex * 2, 2);
                    const word = lb + 256 * hb;
                    const maskedWord = word & pixelMask;
                    pixels.push(maskedWord > 0 ? '#FFFFFF' : '#000000');
                }
            }
            return pixels;
        default:
            for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLUMNS; j++) {
                    pixels.push('#FF69B4');
                }
            }
            return pixels;
    }
}