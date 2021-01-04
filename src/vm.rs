// Abstract implementation of the virtual machine.
// The run loop must be implemented for any target.
pub mod core;

// Helper to translate binary to/from virtual machine.
pub mod codec;

// Additional functionality for live debugger.
pub mod debugger;

// Implementations for multiple target architectures
pub mod targets;