use std::io::{stdin, Read};
use crate::vm::core::{VM, Interrupt};

pub fn main() {
    let args: Vec<String> = std::env::args().collect();
    let mut vm = VM::from_file(&args[1]);
    loop {
        match vm.step() {
            Interrupt::OUT(ch) => {
                print!("{}", ch);
            },
            Interrupt::HALT => {
                break;
            },
            Interrupt::IN(addr) => {
                let mut buffer: [u8; 1] = [0];
                stdin().read(&mut buffer).unwrap();
                vm.input(addr, buffer[0] as u16);
            },
            Interrupt::NONE => {
            },
        }
    }
}