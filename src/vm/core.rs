use crate::vm::codec::parse_file;

// The virtual machine object.
// RAM: 32768 words + 8 registers.
// Stack: unbounded stack of words.
// InstructionPointer: address of current instruction in RAM. Code is loaded at address 0.
pub struct VM {
    pub(super) ram: [u16; 32768 + 8],
    pub(super) stack: Vec<u16>,
    pub(super) ip: usize,
    pub(super) metadata: Metadata,
}

// Metadata associated to the VM.
// Used for debugging.
pub(super) struct Metadata {
    pub(super) word_count: usize,
}

// Result of a step. Target implementation must react as follows:
// NONE: continue with next step.
// OUT(ch): output character 'ch'. Continue with next step.
// IN(addr): await character from user, then vm.input it at the provided addr. Continue with next step.
// HALT: execution has halted, stop stepping.
pub enum Interrupt {
    NONE,
    HALT,
    OUT(char),
    IN(usize),
}

// Core implementation (public methods)
impl VM {
    pub fn from_code(instructions: &[u16]) -> VM {
        let mut ram: [u16; 32768 + 8] = [0; 32768 + 8];
        let mut index = 0;
        for word in instructions.iter() {
            if index > 32767 {
                break;
            }
            ram[index] = *word;
            index += 1;
        }

        return VM {
            ram: ram,
            stack: Vec::new(),
            ip: 0,
            metadata: Metadata {
                word_count: index,
            },
        };
    }

    // Create a new VM, parsing the provided binary.
    pub fn from_file(filename: &str) -> VM {
        let instructions = parse_file(filename);
        return VM::from_code(&instructions);
    }

    // Set word in RAM at address.
    // Must be invoked by target implementation when reacting to Interrupt::IN(addr).
    pub fn input(&mut self, address: usize, value: u16) {
        self.ram[address] = value;
    }

    // Execute instruction at IP, and return the corresponding Interrupt
    // for target implementation to handle.
    pub fn step(&mut self) -> Interrupt {
        let op = self.read();

        // halt
        if op == 0 {
            return Interrupt::HALT;
        }

        // set a b
        if op == 1 {
            let a = self.read();
            let b = self.read_immediate();
            self.ram[a as usize] = b;
            return Interrupt::NONE;
        }

        // push a
        if op == 2 {
            let a = self.read_immediate();
            self.stack.push(a);
            return Interrupt::NONE;
        }

        // pop a
        if op == 3 {
            let a = self.read();
            let w = self.stack.pop().unwrap();
            self.ram[a as usize] = w;
            return Interrupt::NONE;
        }

        // eq a b c
        if op == 4 {
            let a = self.read();
            let b = self.read_immediate();
            let c = self.read_immediate();
            self.ram[a as usize] = (b == c) as u16;
            return Interrupt::NONE;
        }

        // gt a b c
        if op == 5 {
            let a = self.read();
            let b = self.read_immediate();
            let c = self.read_immediate();
            self.ram[a as usize] = (b > c) as u16;
            return Interrupt::NONE;
        }

        // jmp a
        if op == 6 {
            let a = self.read_immediate();
            self.ip = a as usize;
            return Interrupt::NONE;
        }

        // jt a b
        if op == 7 {
            let a = self.read_immediate();
            let b = self.read();
            if a > 0 {
                self.ip = b as usize;
            }
            return Interrupt::NONE;
        }

        // jf a b
        if op == 8 {
            let a = self.read_immediate();
            let b = self.read();
            if a == 0 {
                self.ip = b as usize;
            }
            return Interrupt::NONE;
        }

        // add a b c
        if op == 9 {
            let a = self.read();
            let b = self.read_immediate();
            let c = self.read_immediate();
            self.ram[a as usize] = (((b as u32) + (c as u32)) % 32768) as u16;
            return Interrupt::NONE;
        }

        // mul a b c
        if op == 10 {
            let a = self.read();
            let b = self.read_immediate();
            let c = self.read_immediate();
            self.ram[a as usize] = (((b as u32) * (c as u32)) % 32768) as u16;
            return Interrupt::NONE;
        }

        // mod a b c
        if op == 11 {
            let a = self.read();
            let b = self.read_immediate();
            let c = self.read_immediate();
            self.ram[a as usize] = b % c;
            return Interrupt::NONE;
        }

        // and a b c
        if op == 12 {
            let a = self.read();
            let b = self.read_immediate();
            let c = self.read_immediate();
            self.ram[a as usize] = b & c;
            return Interrupt::NONE;
        }

        // or a b c
        if op == 13 {
            let a = self.read();
            let b = self.read_immediate();
            let c = self.read_immediate();
            self.ram[a as usize] = b | c;
            return Interrupt::NONE;
        }

        // not a b
        if op == 14 {
            let a = self.read();
            let b = self.read_immediate();
            self.ram[a as usize] = !(32768 + b);
            return Interrupt::NONE;
        }

        // rmem a b
        if op == 15 {
            let a = self.read();
            let b = self.read_immediate();
            self.ram[a as usize] = self.ram[b as usize];
            return Interrupt::NONE;
        }

        // wmem a b
        if op == 16 {
            let a = self.read_immediate();
            let b = self.read_immediate();
            self.ram[a as usize] = b;
            return Interrupt::NONE;
        }

        // call a
        if op == 17 {
            let a = self.read_immediate();
            self.stack.push(self.ip as u16);
            self.ip = a as usize;
            return Interrupt::NONE;
        }

        // ret
        if op == 18 {
            let w = self.stack.pop().unwrap();
            self.ip = w as usize;
            return Interrupt::NONE;
        }

        // out a
        if op == 19 {
            let a = self.read_immediate();
            let ch = std::char::from_u32(a as u32).unwrap();
            return Interrupt::OUT(ch);
        }

        // in a
        if op == 20 {
            let a = self.read();
            return Interrupt::IN(a as usize);
        }

        // nop
        if op == 21 {
            return Interrupt::NONE;
        }

        // unknown op
        return Interrupt::HALT;
    }
}

// Core implementation (protected methods)
impl VM {
    // Read word at given address.
    pub(super) fn peek(&self, addr: usize) -> u16 {
        return self.ram[addr];
    }

    // Read next word at IP. Move IP forwards.
    pub(super) fn read(&mut self) -> u16 {
        let w = self.ram[self.ip];
        self.ip += 1;
        return w;
    }

    // Read next word at IP. Move IP forwards.
    // Values 0 ~ 32767 are returned as immediates.
    // Values 32768 ~ 32775 are registers, and their content is returned instead.
    pub(super) fn read_immediate(&mut self) -> u16 {
        let w = self.read();
        if w > 32767 {
            return self.ram[w as usize];
        }
        return w;
    }
}