use wasm_bindgen::prelude::*;
use crate::vm::{core, codec};

// JS object exposing pointers to the linear memory where the actual VM resides.
#[wasm_bindgen]
pub struct VM {
    vm: core::VM,
}

// JS interface.
#[wasm_bindgen]
impl VM {
    // JS 'new VM' constructor. Browser must provide the binary content. 
    #[wasm_bindgen(constructor)]
    pub fn new(bytecode: &[u8]) -> VM {
        let instructions = codec::parse_bytecode(bytecode);
        return VM {
            vm: core::VM::from_code(&instructions)
        };
    }

    // Step the VM, and return a String representing the step interrupt.
    pub fn step(&mut self) -> String {
        match self.vm.step() {
            core::Interrupt::NONE => return "NONE".to_string(),
            core::Interrupt::HALT => return "HALT".to_string(),
            core::Interrupt::IN(addr) => return format!("IN {}", addr),
            core::Interrupt::OUT(ch) => return format!("OUT {}", ch),
        }
    }

    // Browser must call this to continue execution after a 'IN add' interrupt.
    pub fn input(&mut self, address: usize, value: u16) {
        self.vm.input(address, value);
    }

    // JS getter for the VM registers.
    #[wasm_bindgen(getter)]
    pub fn registers(&self) -> Vec<u16> {
        return self.vm.ram[32768..32776].to_vec();
    }

    // JS set register.
    pub fn set_register(&mut self, index: usize, value: u16) {
        self.vm.ram[32768 + index] = value;
    }

    // JS getter for the VM ip.
    #[wasm_bindgen(getter)]
    pub fn ip(&self) -> usize {
        return self.vm.ip;
    }

    // JS set register.
    pub fn set_ip(&mut self, value: usize) {
        self.vm.ip = value;
    }

    // JS getter for the pointer to the ram in linear memory.
    // Must be read from .memory.buffer.
    #[wasm_bindgen(getter)]
    pub fn ram(&self) -> *const u16 {
        return self.vm.ram[0..32768].as_ptr();
    }

    // JS set ram entry.
    pub fn set_ram(&mut self, address: usize, value: u16) {
        self.vm.ram[address] = value;
    }

    // JS getter for the VM stack.
    #[wasm_bindgen(getter)]
    pub fn stack(&self) -> Vec<u16> {
        return self.vm.stack.clone();
    }

    // JS set stack entry.
    pub fn set_stack(&mut self, offset: usize, value: u16) {
        self.vm.stack[offset] = value;
    }

    // Return a mnemonic String for the instruction at given address.
    pub fn disasm(&self, addr: usize) -> String {
        return self.vm.disasm(addr);
    }

    // Return a size (in words) for the instruction at given address.
    pub fn instruction_size(&self, addr: usize) -> usize {
        return self.vm.instruction_size(addr);
    }

    // Return word count of the original vm.
    #[wasm_bindgen(getter)]
    pub fn word_count(&self) -> usize {
        return self.vm.metadata.word_count;
    }
}