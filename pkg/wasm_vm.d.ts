/* tslint:disable */
/* eslint-disable */
/**
*/
export function run(): void;
/**
*/
export class VM {
  free(): void;
/**
* @param {Uint8Array} bytecode
*/
  constructor(bytecode: Uint8Array);
/**
* @returns {string}
*/
  step(): string;
/**
* @param {number} address
* @param {number} value
*/
  input(address: number, value: number): void;
/**
* @param {number} addr
* @returns {string}
*/
  disasm(addr: number): string;
/**
* @param {number} addr
* @returns {number}
*/
  instruction_size(addr: number): number;
/**
* @returns {number}
*/
  readonly ip: number;
/**
* @returns {Uint16Array}
*/
  readonly ram: Uint16Array;
/**
* @returns {Uint16Array}
*/
  readonly registers: Uint16Array;
/**
* @returns {Uint16Array}
*/
  readonly stack: Uint16Array;
/**
* @returns {number}
*/
  readonly word_count: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_vm_free: (a: number) => void;
  readonly vm_new: (a: number, b: number) => number;
  readonly vm_step: (a: number, b: number) => void;
  readonly vm_input: (a: number, b: number, c: number) => void;
  readonly vm_registers: (a: number, b: number) => void;
  readonly vm_ip: (a: number) => number;
  readonly vm_ram: (a: number, b: number) => void;
  readonly vm_stack: (a: number, b: number) => void;
  readonly vm_disasm: (a: number, b: number, c: number) => void;
  readonly vm_instruction_size: (a: number, b: number) => number;
  readonly vm_word_count: (a: number) => number;
  readonly run: () => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
        