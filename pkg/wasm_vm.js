
let wasm;

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

let cachegetUint16Memory0 = null;
function getUint16Memory0() {
    if (cachegetUint16Memory0 === null || cachegetUint16Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint16Memory0 = new Uint16Array(wasm.memory.buffer);
    }
    return cachegetUint16Memory0;
}

function getArrayU16FromWasm0(ptr, len) {
    return getUint16Memory0().subarray(ptr / 2, ptr / 2 + len);
}
/**
*/
export function run() {
    wasm.run();
}

/**
*/
export class VM {

    static __wrap(ptr) {
        const obj = Object.create(VM.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_vm_free(ptr);
    }
    /**
    * @param {Uint8Array} bytecode
    */
    constructor(bytecode) {
        var ptr0 = passArray8ToWasm0(bytecode, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        var ret = wasm.vm_new(ptr0, len0);
        return VM.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    step() {
        try {
            const retptr = wasm.__wbindgen_export_1.value - 16;
            wasm.__wbindgen_export_1.value = retptr;
            wasm.vm_step(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_export_1.value += 16;
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} address
    * @param {number} value
    */
    input(address, value) {
        wasm.vm_input(this.ptr, address, value);
    }
    /**
    * @returns {Uint16Array}
    */
    get registers() {
        try {
            const retptr = wasm.__wbindgen_export_1.value - 16;
            wasm.__wbindgen_export_1.value = retptr;
            wasm.vm_registers(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU16FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 2);
            return v0;
        } finally {
            wasm.__wbindgen_export_1.value += 16;
        }
    }
    /**
    * @param {number} index
    * @param {number} value
    */
    set_register(index, value) {
        wasm.vm_set_register(this.ptr, index, value);
    }
    /**
    * @returns {number}
    */
    get ip() {
        var ret = wasm.vm_ip(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} value
    */
    set_ip(value) {
        wasm.vm_set_ip(this.ptr, value);
    }
    /**
    * @returns {number}
    */
    get ram() {
        var ret = wasm.vm_ram(this.ptr);
        return ret;
    }
    /**
    * @param {number} address
    * @param {number} value
    */
    set_ram(address, value) {
        wasm.vm_set_ram(this.ptr, address, value);
    }
    /**
    * @returns {Uint16Array}
    */
    get stack() {
        try {
            const retptr = wasm.__wbindgen_export_1.value - 16;
            wasm.__wbindgen_export_1.value = retptr;
            wasm.vm_stack(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU16FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 2);
            return v0;
        } finally {
            wasm.__wbindgen_export_1.value += 16;
        }
    }
    /**
    * @param {number} offset
    * @param {number} value
    */
    set_stack(offset, value) {
        wasm.vm_set_stack(this.ptr, offset, value);
    }
    /**
    * @param {number} addr
    * @returns {string}
    */
    disasm(addr) {
        try {
            const retptr = wasm.__wbindgen_export_1.value - 16;
            wasm.__wbindgen_export_1.value = retptr;
            wasm.vm_disasm(retptr, this.ptr, addr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_export_1.value += 16;
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {number} addr
    * @returns {number}
    */
    instruction_size(addr) {
        var ret = wasm.vm_instruction_size(this.ptr, addr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    get word_count() {
        var ret = wasm.vm_word_count(this.ptr);
        return ret >>> 0;
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {

        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = import.meta.url.replace(/\.js$/, '_bg.wasm');
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_log_ff727a13d6ea62e4 = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    wasm.__wbindgen_start();
    return wasm;
}

export default init;

