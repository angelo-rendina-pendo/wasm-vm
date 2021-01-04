export default {
    name: 'Monitor',
    props: {
        vm: {
            type: Object,
            default: null
        },
        refresh: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            shownLines: 40,
            localAddress: 0,
            followIP: false,
            decodeASCII: false
        };
    },
    computed: {
        address() {
            this.refresh;
            if (this.followIP) {
                this.localAddress = this.vm.ip;
            }
            return this.localAddress;
        },
        lines() {
            this.refresh;
            let lines = [];
            let address = this.address;
            while (address < 32768) {
                const size = this.vm.instruction_size(address);
                let words = [];
                for(let i = 0; i < size; i++) {
                    const [lb, hb] = new Uint8Array(window.wasm.memory.buffer, this.vm.ram + (address + i) * 2, 2);
                    words.push(lb + 256 * hb);
                }
                let mnemonic = this.vm.disasm(address);
                if (this.decodeASCII && mnemonic.startsWith('OUT')) {
                    const v = parseInt(mnemonic.substring(4));
                    mnemonic = `OUT '${String.fromCharCode(v)}'`;
                }
                lines.push({
                    address,
                    words,
                    mnemonic
                });
                address += size;
                if (lines.length >= this.shownLines) break;
            }
            return lines;
        }
    },
    methods: {
        onAddressChange(event) {
            const { value } = event.target;
            const address = parseInt(value);
            if (!isNaN(address) && address >= 0 && address < 32768) {
                this.localAddress = address;
            }
        },
        onAddressBlur(event) {
            event.target.value = this.localAddress;
        },
        onFollowIP(isChecked) {
            this.followIP = isChecked;
        },
        onDecodeASCIII(isChecked) {
            this.decodeASCII = isChecked;
        }
    },
    render: function(h) {
        return h('div', [
            h('div', {
                attrs: { class: 'debugger__quadrant__title' }
            }, 'Monitor'),
            h('div', {
                attrs: { id: 'monitor__toolbar' }
            }, [
                h('label', 'Viewing'),
                h('input', {
                    attrs: {
                        type: 'number',
                        min: '0',
                        max: '32767',
                        placeholder: this.localAddress
                    },
                    domProps: {
                        value: this.localAddress,
                        disabled: this.followIP
                    },
                    on: {
                        change: this.onAddressChange,
                        blur: this.onAddressBlur
                    }
                }),
                h('button', {
                    on: {
                        click: () => { this.localAddress = this.vm.ip; }
                    }
                }, 'Go IP'),
                h('input', {
                    attrs: { type: 'checkbox' },
                    domProps: { checked: this.followIP },
                    on: {
                        input: event => this.onFollowIP(event.target.checked)
                    }
                }),
                h('label', 'Follow IP'),
                h('input', {
                    attrs: { type: 'checkbox' },
                    domProps: { checked: this.decodeASCII },
                    on: {
                        input: event => this.onDecodeASCIII(event.target.checked)
                    }
                }),
                h('label', 'Decode ASCII')
            ]),
            h('div', {
                attrs: { id: 'monitor__display__header' }
            }, [
                h('span', {
                    attrs: { class: 'monitor__display__line__address' }
                }, 'Address'),
                h('span', {
                    attrs: { class: 'monitor__display__line__mnemonic' }
                }, 'Mnemonic'),
                h('span', {
                    attrs: { class: 'monitor__display__line__word' }
                }, 'Raw')
            ]),
            h('div', {
                attrs: { id: 'monitor__display' }
            }, this.lines.map(line => {
                return h('div', {
                    class: {
                        'monitor__display__line': true,
                        'active': line.address === this.vm.ip
                    }
                }, [
                    h('span', {
                        attrs: { class: 'monitor__display__line__address' }
                    }, line.address),
                    h('span', {
                        attrs: { class: 'monitor__display__line__mnemonic' }
                    }, line.mnemonic),
                    h('span', {
                        attrs: { class: 'monitor__display__line__word' }
                    }, line.words.map(word => h('span', word)))                    
                ])
            }))
        ]);
    }
};