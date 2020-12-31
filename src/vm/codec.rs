use std::fs::File;
use std::io::Read;

// Decode (little_endian) binary file to vector of words.
pub(super) fn parse_file(filename: &str) -> Vec<u16> {
    let bin: Vec<u8> = read_file_bytes(filename);
    return decode(&bin);
}

// Decode (little_endian) binary slice to vector of words.
pub(super) fn parse_bytecode(bytecode: &[u8]) -> Vec<u16> {
    return decode(&bytecode.to_vec());
}

// Helper: turn (little_endian) bytecode vector into words vector
fn decode(bin: &Vec<u8>) -> Vec<u16> {
    let decoded_size: usize = bin.len() / 2;
    let mut buffer: Vec<u16> = Vec::with_capacity(decoded_size);
    for i in 0..decoded_size {
        let bytes = [bin[2 * i], bin[2 * i + 1]];
        buffer.push(from_little_endian(bytes));
    }
    return buffer;
}

// Helper: read binary content from file as byte vector.
fn read_file_bytes(filename: &str) -> Vec<u8> {
    let mut f = File::open(filename).expect("no file found");
    let metadata = std::fs::metadata(filename).expect("unable to read metadata");
    let mut buffer = vec![0; metadata.len() as usize];
    f.read(&mut buffer).expect("buffer overflow");

    return buffer;
}

// Helper: interpret two bytes as little_endian word.
fn from_little_endian(bytes: [u8; 2]) -> u16 {
    return (bytes[0] as u16) + 256 * (bytes[1] as u16);
}