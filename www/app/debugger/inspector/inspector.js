export default {
    name: 'Inspector',
    props: {
        vm: {
            type: Object,
            default: null
        },
        refresh: {
            type: Boolean,
            default: false
        },
        inputInterrupt: {
            type: String,
            default: null
        },
        halted: {
            type: Boolean,
            default: false
        },
        breakpoint: {
            type: Number,
            default: null
        },
        breakpointInterrupt: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        ip() {
            this.refresh;
            return this.vm.ip;
        },
        registers() {
            this.refresh;
            return [].slice.call(this.vm.registers);
        },
        immediateInterrupt() {
            if (!this.inputInterrupt) return '';
            const address = parseInt(this.inputInterrupt.substring(3));
            return `IN r${address - 32768}`;
        }
    },
    methods: {
        step() {
            this.$emit('step');
        },
        run() {
            this.$emit('run');
        },
        onBreakpointChanged(event) {
            this.$emit('breakpointChanged', event.target.value);
        },
        onBreakpointBlur(event) {
            event.target.value = this.breakpoint === null ? '' : this.breakpoint;
        },
    },
    render: function(h) {
        return h('div', [
            h('div', {
                attrs: { class: 'debugger__quadrant__title' }
            }, 'Inspector'),
            h(`div`, [
                h('button', {
                    on: {
                        click: this.step
                    },
                    domProps: {
                        disabled: this.halted
                    },
                }, 'Step'),
                h('button', {
                    on: {
                        click: this.run
                    },
                    domProps: {
                        disabled: this.halted
                    }
                }, 'Run'),
                h('input', {
                    attrs: {
                        type: 'number',
                        min: '0',
                        max: '32767',
                        placeholder: 'Breakpoint',
                        style: 'width: 80px;'
                    },
                    domProps: {
                        value: this.breakpoint
                    },
                    on: {
                        change: this.onBreakpointChanged,
                        blur: this.onBreakpointBlur
                    }
                }),
                ...(this.inputInterrupt ? [
                    h('span', `Interrupted at "${this.immediateInterrupt}". Provide more input buffer above and step/run to feed it`)
                ] : []),
                ...(this.halted ? [
                    h('span', `Halted`)
                ] : []),
                ...(this.breakpointInterrupt ? [
                    h('span', `Hit breakpoint`)
                ] : []),
            ]),
            h('table', [
                ...this.registers.map((v,i) => {
                    return h('tr', [
                        h('td', `r${i}`),
                        h('td', v)
                    ]);
                }),
                h('tr', [
                    h('td', 'IP'),
                    h('td', this.ip)
                ])
            ])
        ]);
    }
};