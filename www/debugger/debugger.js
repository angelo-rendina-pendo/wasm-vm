import Menu from './menu/menu.js';
import Monitor from './monitor/monitor.js';
import Console from './console/console.js';
import Inspector from './inspector/inspector.js';
import Dump from './dump/dump.js';
import { VM } from '../../pkg/wasm_vm.js';

export default {
    name: 'Debugger',
    data () {
        return {
            vm: null,
            refresh: false,
            inputInterrupt: null,
            halted: false
        };
    },
    methods: {
        onFileOpened(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.addEventListener('loadend', (event) => {
                const buffer = event.target.result;
                const data = new Uint8Array(buffer);
                this.vm = new VM(data);
            });
            reader.readAsArrayBuffer(file);
        },
        step() {
            const interrupt = this.inputInterrupt || this.vm.step();
            this.handleInterrupt(interrupt);
            this.doRefresh();
        },
        run() {
            while (true) {
                const interrupt = this.inputInterrupt || this.vm.step();
                const handled = this.handleInterrupt(interrupt);
                if (!handled) break;
            }
            this.doRefresh();
        },
        doRefresh() {
            this.refresh = true;
            setTimeout(() => {
                this.refresh = false;
            }, 0);
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
        }, [
            h(Menu, {
                attrs: { id: 'debugger__manu' },
                on: { opened: this.onFileOpened }
            }),
            h('div', {
                attrs: { id: 'debugger__viewport' }
            }, this.vm ? [
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
                        halted: this.halted
                    },
                    on: {
                        step: this.step,
                        run: this.run
                    }
                })
            ] : [
                h('div', 'Load a binary file to start the debugger.')
            ])
        ]);
    }
};