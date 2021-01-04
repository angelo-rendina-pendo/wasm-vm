const INSTRUCTIONS = {
    'HALT': {
        opcode: 0,
        size: 1
    },
    'SET': {
        opcode: 1,
        size: 3
    },
    'PUSH': {
        opcode: 2,
        size: 2
    },
    'POP': {
        opcode: 3,
        size: 2
    },
    'EQ': {
        opcode: 4,
        size: 4
    },
    'GT': {
        opcode: 5,
        size: 4
    },
    'JMP': {
        opcode: 6,
        size: 2
    },
    'JT': {
        opcode: 7,
        size: 3
    },
    'JF': {
        opcode: 8,
        size: 3
    },
    'ADD': {
        opcode: 9,
        size: 4
    },
    'MUL': {
        opcode: 10,
        size: 4
    },
    'MOD': {
        opcode: 11,
        size: 4
    },
    'AND': {
        opcode: 12,
        size: 4
    },
    'OR': {
        opcode: 13,
        size: 4
    },
    'NOT': {
        opcode: 14,
        size: 3
    },
    'RMEM': {
        opcode: 15,
        size: 3
    },
    'WMEM': {
        opcode: 16,
        size: 3
    },
    'CALL': {
        opcode: 17,
        size: 2
    },
    'RET': {
        opcode: 18,
        size: 1
    },
    'OUT': {
        opcode: 19,
        size: 2
    },
    'IN': {
        opcode: 20,
        size: 2
    },
    'NOP': {
        opcode: 21,
        size: 1
    },
    '??': {
        size: 1
    }
};

const MACROS = {
    '!print': (line, tokens) => {
        if (tokens.length < 2) {
            throw new Error(`Not enough arguments in '${line}`);
        }
        if ((line.match(/\`/g) || []).length !== 2) {
            throw new Error(`Malformed expression in '${line}' (missing backticks?)`);
        }
        const quotedTokens = line.split('`');
        if (quotedTokens.length !== 3) {
            throw new Error(`Malformed expression in '${line}'`);
        }
        if (quotedTokens[0] !== '!print ' || quotedTokens[2] !== '') {
            throw new Error(`Malformed expression in '${line}'`);
        }
        const lines = [];
        for(let i = 0; i < quotedTokens[1].length; i++) {
            const c = quotedTokens[1].charCodeAt(i);
            lines.push(`OUT ${c}`);
        }
        return lines;
    },
    '!println': (line, tokens) => {
        const newTokens = [...tokens];
        newTokens[0] = '!print';
        let lines = MACROS['!print'](newTokens.join(' '), tokens);
        lines.push('OUT 10');
        return lines;
    },
    '!neg': (line, tokens) => {
        if (tokens.length !== 3) {
            throw new Error(`Wrong arguments number in '${line}' (expected 3, got ${tokens.length})`);
        }
        const lines = [];
        lines.push(`NOT ${tokens[1]} ${tokens[2]}`);
        lines.push(`ADD ${tokens[1]} ${tokens[1]} 1`)
        return lines;
    }
};

function parseImmediate(imm) {
    if (imm.startsWith('r')) {
        const n = parseInt(imm.substring(1));
        if (!isNaN(n) && n >= 0 && n < 8) {
            return 32768 + n;
        }
    } else {
        const n = parseInt(imm);
        if (!isNaN(n) && n >= 0 && n < 32776) {
            return n;
        }
    }
    throw new Error(`'${imm}' is not a valid value.`);
}

function littleEndian(value) {
    const low = Math.floor(value % 256);
    const high = Math.floor(value / 256);
    return [low, high];
}

export function compile(sourceText) {
    let source = sourceText.split(/\r?\n/);

    // Remove comments/empty
    source = source.reduce((parsed, line) => {
        let wline = line.trim();
        if (wline !== '' && !wline.startsWith('#')) {
            parsed.push(wline);
        }
        return parsed;
    }, []);

    // Parse data
    const data = {};
    source = source.reduce((parsed, line) => {
        if (line.startsWith('.')) {
            const tokens = line.split(' ');
            if (tokens.length !== 2 && tokens.length !== 3) {
                throw new Error(`Invalid data definition in '${line}' (expected 2 or 3 arguments, got ${tokens.length})`);
            }
            const value = parseInt(tokens[1]);
            if (isNaN(value)) {
                throw new Error(`Invalid data value in '${line}'`);
            }
            let size = 1;
            if (tokens.length === 3) {
                size = parseInt(tokens[2]);
                if (isNaN(size)) {
                    throw new Error(`Invalid data size in '${line}'`);
                }
            }
            data[tokens[0]] = { value, size };
        } else {
            parsed.push(line);
        }
        return parsed;
    }, []);

    // Inline macros
    source = source.reduce((parsed, line) => {
        if (line.startsWith('!')) {
            const tokens = line.split(' ');
            const macro = MACROS[tokens[0]];
            if (!macro) throw new Error(`Invalid macro in '${line}'`);
            const inlined = macro(line, tokens);
            parsed = parsed.concat(inlined);
        } else {
            parsed.push(line);
        }
        return parsed;
    }, []);

    // Parse labels
    const labels = {};
    let offset = 0;
    source = source.reduce((parsed, line) => {
        if (line.startsWith(':')) {
            labels[line] = offset;
        } else {
            const tokens = line.split(' ');
            const instr = INSTRUCTIONS[tokens[0]];
            if (!instr) throw new Error(`Invalid instruction in '${line}'`);
            offset += instr.size;
            parsed.push(line);
        }
        return parsed;
    }, []);

    // Epilogue, allocate data
    let epilogue = [];
    for (const sym in data) {
        const { value, size } = data[sym];
        data[sym] = offset;
        offset += size;
        for(let i = 0; i < size; i++) {
            epilogue = epilogue.concat(littleEndian(value));
        }
    }

    // Interpolate symbols
    for(let i = 0; i < source.length; i++) {
        const tokens = source[i].split(' ');
        for (let j = 0; j < tokens.length; j++) {
            const token = tokens[j];
            if (token.startsWith(':')) {
                const location = labels[token];
                if (location === undefined) {
                    throw new Error(`Label '${token}' is not defined.`);
                }
                tokens[j] = location;
            }
            if (token.startsWith('.')) {
                const location = data[token];
                if (location === undefined) {
                    throw new Error(`Data '${token}' is not defined.`);
                }
                tokens[j] = location;
            }
        }
        source[i] = tokens.join(' ');
    }

    // Parse lines to bytecode
    let compiled = source.reduce((bytecode, line) => {
        const tokens = line.split(' ');
        const instr = INSTRUCTIONS[tokens[0]];
        const size = tokens[0] === '??' ? 2 : instr.size;
        if (tokens.length !== size) {
            throw new Error(`Wrong arguments number in '${line}' (expected ${size}, got ${tokens.length})`);
        }
        if (tokens[0] === '??') {
            const imm = parseInt(tokens[1]);
            if (isNaN(imm) || imm < 0 || imm > 32775) {
                throw new Error(`Invalid constant value in '${line}' (must be 0~32775, got ${tokens[1]})`);
            }
            bytecode = bytecode.concat(littleEndian(imm));
        } else {
            bytecode = bytecode.concat(littleEndian(instr.opcode));
            for(let i = 1; i < size; i++) {
                const parsedImm = parseImmediate(tokens[i]);
                bytecode = bytecode.concat(littleEndian(parsedImm));
            }
        }
        return bytecode;
    }, []);

    // Append epilogue
    compiled = compiled.concat(epilogue);

    // Tada!
    return new Uint8Array(compiled);
}