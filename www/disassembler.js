function readWord(vm, address) {
    const [lowByte, highByte] = new Uint8Array(window.wasm.memory.buffer, vm.ram + address * 2, 2);
    return lowByte + 256 * highByte;
}

export function disassemble(vm, options) {
    const wordCount = vm.word_count;

    const jumpTargets = new Set();
    const callTargets = new Set();
    const memTargets = new Set();
    for (let address = 0; address < wordCount; address += vm.instruction_size(address)) {
        const op = readWord(vm, address);
        const mnemonic = vm.disasm(address);
        const tokens = mnemonic.split(' ');
        if (options.jumpToLabel && op > 5 && op < 9) {
            const target = parseInt(tokens[op === 6 ? 1 : 2]);
            if (!isNaN(target)) {
                jumpTargets.add(target);
            }
        }
        if (options.callToLabel && op === 17) {
            const target = parseInt(tokens[1]);
            if (!isNaN(target)) {
                callTargets.add(target);
            }
        }
        if (options.memsToLabel && op > 14 && op < 17) {
            for (let i = 1; i < 3; i++) {
                const target = parseInt(tokens[i]);
                if (!isNaN(target)) {
                    memTargets.add(target);
                }
            }
        }
    }
    
    const targetsInfo = [
        { list: jumpTargets, label: ':jump-' },
        { list: callTargets, label: ':proc-' },
        { list: memTargets, label: ':data-' }
    ];
    const alignedTargets = new Set();
    for (let address = 0; address < wordCount; address += vm.instruction_size(address)) {
        targetsInfo.forEach(({ list }) => {
            if (list.has(address)) {
                alignedTargets.add(address);
            }
        });
    }

    let lines = [];
    let outBuffer = '';
    for (let address = 0; address < wordCount; address += vm.instruction_size(address)) {
        targetsInfo.forEach(({ list, label }) => {
            if (alignedTargets.has(address) && list.has(address)) {
                lines.push(`${label}${address}`);
                list.delete(address);
            }
        });
        const op = readWord(vm, address);
        let mnemonic = vm.disasm(address);
        let doPushMnemonic = true;
        if (options.outToMacro) {
            if (op === 19) {
                const arg = readWord(vm, address + 1);
                if (arg === 10) {
                    lines.push(`!println \`${outBuffer}\``);
                    outBuffer = '';
                } else {
                    outBuffer += String.fromCharCode(arg);
                    if (alignedTargets.has(address + 2)) {
                        lines.push(`!print \`${outBuffer}\``);
                        outBuffer = '';
                    }
                }
                doPushMnemonic = false;
            } else {
                if (outBuffer) {
                    lines.push(`!print \`${outBuffer}\``);
                    outBuffer = '';
                }
            }
        }
        if (doPushMnemonic) {
            if (mnemonic === '??') {
                lines.push(`?? ${op}`);
            } else {
                const tokens = mnemonic.split(' ');
                if (options.jumpToLabel && op > 5 && op < 9) {  
                    const position = op === 6 ? 1 : 2;
                    const target = parseInt(tokens[position]);
                    if (!isNaN(target) && alignedTargets.has(target)) {
                        tokens[position] = `:jump-${target}`;
                        mnemonic = tokens.join(' ');
                    }
                }
                if (options.callToLabel && op === 17) {  
                    const target = parseInt(tokens[1]);
                    if (!isNaN(target) && alignedTargets.has(target)) {
                        tokens[1] = `:proc-${target}`;
                        mnemonic = tokens.join(' ');
                    }
                }
                if (options.memsToLabel && op > 14 && op < 17) {
                    for (let i = 1; i < 3; i++) {
                        const target = parseInt(tokens[i]);
                        if (!isNaN(target) && alignedTargets.has(target)) {
                            tokens[i] = `:data-${target}`;
                        }
                    }
                    mnemonic = tokens.join(' ');
                }
                lines.push(mnemonic);
            }
        }
    }
    
    const unalignedLines = [];
    targetsInfo.forEach(({ list, label }) => {
        list.forEach(address => {
            unalignedLines.push(`# Unaligned ${label}${address}`);
        });
    });
    lines = unalignedLines.concat(lines);

    return lines;
}