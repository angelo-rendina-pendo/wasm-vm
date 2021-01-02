/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_vm_free(a: number): void;
export function vm_new(a: number, b: number): number;
export function vm_step(a: number, b: number): void;
export function vm_input(a: number, b: number, c: number): void;
export function vm_registers(a: number, b: number): void;
export function vm_ip(a: number): number;
export function vm_ram(a: number, b: number): void;
export function vm_stack(a: number, b: number): void;
export function vm_disasm(a: number, b: number, c: number): void;
export function vm_instruction_size(a: number, b: number): number;
export function vm_word_count(a: number): number;
export function run(): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_start(): void;
