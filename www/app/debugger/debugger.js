import Monitor from './monitor/monitor.js';
import Console from './console/console.js';
import Inspector from './inspector/inspector.js';
import Dump from './dump/dump.js';
import { VM } from '../../../pkg/wasm_vm.js';
import { disassemble } from '../../disassembler.js';

export default {
    name: 'Debugger',
    data () {
        return {
            vm: null,
            refresh: false,
            inputInterrupt: null,
            halted: false,
            breakpoint: null,
            breakpointInterrupt: false
        };
    },
    props: {
        wasm: {
            type: Object,
            default: null
        }
    },
    methods: {
        disassemble() {
            const options = {
                outToMacro: this.$refs.outToMacroCheckbox.checked,
                jumpToLabel: this.$refs.jumpToLabelCheckbox.checked,
                callToLabel: this.$refs.callToLabelCheckbox.checked,
                memsToLabel: this.$refs.memsToLabelCheckbox.checked
            };
            const lines = disassemble(this.vm, options);
            this.$emit('disassembled', lines.join('\n'));
        },
        onVmLoaded(vm) {
            this.vm = vm;
            this.inputInterrupt = null;
            this.halted = false;
            this.breakpointInterrupt = false;
            this.breakpoint = null;
            this.$nextTick(() => {
                this.$refs.console.onClear();
            });
        },
        onFileOpened(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.addEventListener('loadend', (event) => {
                const buffer = event.target.result;
                const bytecode = new Uint8Array(buffer);
                this.onVmLoaded(new VM(bytecode));
            });
            reader.readAsArrayBuffer(file);
        },
        onCompiledToDebugger(bytecode) {
            this.onVmLoaded(new VM(bytecode));
        },
        step() {
            this.breakpointInterrupt = false;
            const interrupt = this.inputInterrupt || this.vm.step();
            this.handleInterrupt(interrupt);
            this.doRefresh();
        },
        run() {
            while (true) {
                if (!this.breakpointInterrupt) {
                    const bp = this.breakpoint;
                    if (bp !== null && bp === this.vm.ip) {
                        this.breakpointInterrupt = true;
                        break;
                    }
                }
                this.breakpointInterrupt = false;
                const interrupt = this.inputInterrupt || this.vm.step();
                const handled = this.handleInterrupt(interrupt);
                if (!handled) break;
            }
            this.doRefresh();
        },
        onBreakpointChanged(value) {
            const address = parseInt(value);
            this.breakpoint = isNaN(address) ? null : address;
        },
        doRefresh() {
            this.refresh = true;
            this.$nextTick(() => {
                this.refresh = false;
            });
        },
        handleInterrupt(int) {
            if (int === 'NONE') {
                return true;
            }
            if (int === 'HALT') {
                this.halted = true;
                return false;
            }
            if (int.startsWith('OUT')) {
                this.$refs.console.output(int.substring(4));
                return true;
            }
            if (int.startsWith('IN')) {
                const address = parseInt(int.substring(3));
                if (this.$refs.console.feed(address)) {
                    this.inputInterrupt = null;
                    return true;
                };
                this.inputInterrupt = int;
                return false;
            }
            return false;
        }
    },
    render: function(h) {
        return h('div', {
            attrs: { id: 'debugger' }
        }, this.vm ? [
            h('div', {
                attrs: { id: 'debugger__viewport' }
            }, [
                h(Monitor, {
                    attrs: { id: 'monitor' },
                    props: {
                        vm: this.vm,
                        refresh: this.refresh
                    }
                }),
                h(Console, {
                    attrs: { id: 'console' },
                    ref: 'console',
                    props: {
                        vm: this.vm
                    }
                }),
                h(Dump, {
                    attrs: { id: 'dump' },
                    props: {
                        vm: this.vm,
                        refresh: this.refresh
                    }
                }),
                h(Inspector, {
                    attrs: { id: 'inspector' },
                    props: {
                        vm: this.vm,
                        refresh: this.refresh,
                        inputInterrupt: this.inputInterrupt,
                        halted: this.halted,
                        breakpoint: this.breakpoint,
                        breakpointInterrupt: this.breakpointInterrupt
                    },
                    on: {
                        step: this.step,
                        run: this.run,
                        breakpointChanged: this.onBreakpointChanged,
                        refreshRequested: this.doRefresh
                    }
                })
            ]),
            h('div', {
                attrs: { id: 'debugger__toolbar' }
            }, [
                h('div', {
                    attrs: { class: 'debugger__toolbar__header' }
                }, 'Disassemble'),
                h('span', [
                    h('input', {
                        ref: 'outToMacroCheckbox',
                        attrs: {
                            type: 'checkbox'
                        }
                    }),
                    h('label', 'OUT to macro')
                ]),
                h('span', [
                    h('input', {
                        ref: 'jumpToLabelCheckbox',
                        attrs: {
                            type: 'checkbox'
                        }
                    }),
                    h('label', 'Jumps to label')
                ]),
                h('span', [
                    h('input', {
                        ref: 'callToLabelCheckbox',
                        attrs: {
                            type: 'checkbox'
                        }
                    }),
                    h('label', 'CALL to label'),
                ]),
                h('span', [
                    h('input', {
                        ref: 'memsToLabelCheckbox',
                        attrs: {
                            type: 'checkbox'
                        }
                    }),
                    h('label', 'MEMs to label')
                ]),
                h('button', {
                    on: { click: this.disassemble }
                }, 'Disassemble')
            ])
        ] : [
            h('span', 'Loading...')
        ]);
    }
};