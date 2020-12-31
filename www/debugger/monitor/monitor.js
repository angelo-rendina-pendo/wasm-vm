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
                const word = this.vm.ram[address];
                let mnemonic = this.vm.disasm(address);
                if (this.decodeASCII && mnemonic.startsWith('OUT')) {
                    const v = parseInt(mnemonic.substring(4));
                    mnemonic = `OUT '${String.fromCharCode(v)}'`;
                }
                lines.push({
                    address,
                    word,
                    mnemonic
                });
                address += size;
                if (lines.length >= this.shownLines) break;
            }
            return lines;
        }
    },
    methods: {
        onAddressChange(newAddress) {
            this.localAddress = newAddress;
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
                        max: '32767'
                    },
                    domProps: {
                        value: this.localAddress,
                        disabled: this.followIP
                    },
                    on: {
                        input: event => this.onAddressChange(parseInt(event.target.value))
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
                    attrs: { class: 'monitor__display__line__word' }
                }, 'Word'),
                h('span', 'Mnemonic'),
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
                        attrs: { class: 'monitor__display__line__word' }
                    }, line.word),
                    h('span', line.mnemonic)
                ])
            }))
        ]);
    }
};