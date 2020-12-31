use crate::vm::core::VM;

// Debugger helper methods
impl VM {
    // Return string representation for address in RAM.
    // 0 ~ 32767 are immediate values.
    // 32768 ~ 32775 are registers 0 ~ 8.
    fn ram_label(addr: u16) -> String {
        match addr {
            32768 => return "r0".to_string(),
            32769 => return "r1".to_string(),
            32770 => return "r2".to_string(),
            32771 => return "r3".to_string(),
            32772 => return "r4".to_string(),
            32773 => return "r5".to_string(),
            32774 => return "r6".to_string(),
            32775 => return "r7".to_string(),
            _ => return addr.to_string(),
        }
    }

    // Return instruction's words count.
    pub(super) fn instruction_size(&self, addr: usize) -> usize {
        let op = self.peek(addr);

        // halt
        if op == 0 {
            return 1;
        }

        // set a b
        if op == 1 {
            return 3;
        }

        // push a
        if op == 2 {
            return 2;
        }

        // pop a
        if op == 3 {
            return 2;
        }

        // eq a b c
        if op == 4 {
            return 4;
        }

        // gt a b c
        if op == 5 {
            return 4;
        }

        // jmp a
        if op == 6 {
            return 2;
        }

        // jt a b
        if op == 7 {
            return 3;
        }

        // jf a b
        if op == 8 {
            return 3;
        }

        // add a b c
        if op == 9 {
            return 4;
        }

        // mul a b c
        if op == 10 {
            return 4;
        }

        // mod a b c
        if op == 11 {
            return 4;
        }

        // and a b c
        if op == 12 {
            return 4;
        }

        // or a b c
        if op == 13 {
            return 4;
        }

        // not a b
        if op == 14 {
            return 3;
        }

        // rmem a b
        if op == 15 {
            return 3;
        }

        // wmem a b
        if op == 16 {
            return 3;
        }

        // call a
        if op == 17 {
            return 2;
        }

        // ret
        if op == 18 {
            return 1;
        }

        // out a
        if op == 19 {
            return 2;
        }

        // in a
        if op == 20 {
            return 2;
        }

        // nop
        if op == 21 {
            return 1;
        }

        // unknown op
        return 1;
    }

    // Return mnemonic representation of instruction at given address.
    pub(super) fn disasm(&self, addr: usize) -> String {
        let op = self.peek(addr);

        // halt
        if op == 0 {
            return "HALT".to_string();
        }

        // set a b
        if op == 1 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            return format!("SET {} {}", VM::ram_label(a), VM::ram_label(b));
        }

        // push a
        if op == 2 {
            let a = self.peek(addr + 1);
            return format!("PUSH {}", VM::ram_label(a));
        }

        // pop a
        if op == 3 {
            let a = self.peek(addr + 1);
            return format!("POP {}", VM::ram_label(a));
        }

        // eq a b c
        if op == 4 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            let c = self.peek(addr + 3);
            return format!("EQ {} {} {}", VM::ram_label(a), VM::ram_label(b), VM::ram_label(c));
        }

        // gt a b c
        if op == 5 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            let c = self.peek(addr + 3);
            return format!("GT {} {} {}", VM::ram_label(a), VM::ram_label(b), VM::ram_label(c));
        }

        // jmp a
        if op == 6 {
            let a = self.peek(addr + 1);
            return format!("JMP {}", VM::ram_label(a));
        }

        // jt a b
        if op == 7 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            return format!("JT {} {}", VM::ram_label(a), VM::ram_label(b));
        }

        // jf a b
        if op == 8 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            return format!("JF {} {}", VM::ram_label(a), VM::ram_label(b));
        }

        // add a b c
        if op == 9 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            let c = self.peek(addr + 3);
            return format!("ADD {} {} {}", VM::ram_label(a), VM::ram_label(b), VM::ram_label(c));
        }

        // mul a b c
        if op == 10 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            let c = self.peek(addr + 3);
            return format!("MUL {} {} {}", VM::ram_label(a), VM::ram_label(b), VM::ram_label(c));
        }

        // mod a b c
        if op == 11 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            let c = self.peek(addr + 3);
            return format!("MOD {} {} {}", VM::ram_label(a), VM::ram_label(b), VM::ram_label(c));
        }

        // and a b c
        if op == 12 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            let c = self.peek(addr + 3);
            return format!("AND {} {} {}", VM::ram_label(a), VM::ram_label(b), VM::ram_label(c));
        }

        // or a b c
        if op == 13 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            let c = self.peek(addr + 3);
            return format!("OR {} {} {}", VM::ram_label(a), VM::ram_label(b), VM::ram_label(c));
        }

        // not a b
        if op == 14 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            return format!("NOT {} {}", VM::ram_label(a), VM::ram_label(b));
        }

        // rmem a b
        if op == 15 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            return format!("RMEM {} {}", VM::ram_label(a), VM::ram_label(b));
        }

        // wmem a b
        if op == 16 {
            let a = self.peek(addr + 1);
            let b = self.peek(addr + 2);
            return format!("WMEM {} {}", VM::ram_label(a), VM::ram_label(b));
        }

        // call a
        if op == 17 {
            let a = self.peek(addr + 1);
            return format!("CALL {}", VM::ram_label(a));
        }

        // ret
        if op == 18 {
            return "RET".to_string();
        }

        // out a
        if op == 19 {
            let a = self.peek(addr + 1);
            return format!("OUT {}", VM::ram_label(a));
        }

        // in a
        if op == 20 {
            let a = self.peek(addr + 1);
            return format!("IN {}", VM::ram_label(a));
        }

        // nop
        if op == 21 {
            return "NOP".to_string();
        }

        // unknown op
        return "??".to_string();
    }
}