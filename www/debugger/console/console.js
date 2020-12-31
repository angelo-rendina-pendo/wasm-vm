export default {
    name: 'Console',
    props: {
        vm: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            outputBuffer: '',
            inputBuffer: '',
            enterBuffered: false
        };
    },
    methods: {
        output(c) {
            const add = c.charCodeAt(0) === 10 ? '<br>' : c;
            this.outputBuffer = `${this.outputBuffer}${add}`;
            setTimeout(() => {
                const view = document.getElementById('console__output');
                view.scrollTop = view.scrollHeight;
            }, 0);
        },
        input(event) {
            this.inputBuffer = event.target.value;
        },
        feed(address) {
            if (this.inputBuffer === '') {
                if(this.enterBuffered) {
                    this.vm.input(address, 10);
                    this.enterBuffered = false;
                    return true;
                }
            } else {
                const charCode = this.inputBuffer.charCodeAt(0);
                const char = this.inputBuffer.charAt(0);
                this.inputBuffer = this.inputBuffer.substring(1);
                this.vm.input(address, charCode);
                this.output(char);
                return true;
            }
            return false;
        },
        onEnter(event) {
            this.enterBuffered = event.target.checked;
        },
        onClear() {
            this.outputBuffer = '';
        }
    },
    render: function(h) {
        return h('div', [
            h('div', {
                attrs: { class: 'debugger__quadrant__title' }
            }, 'Console'),
            h('div', {
                attrs: { id: 'console__toolbar' }
            }, [
                h('button', {
                    on: { click: this.onClear }
                }, 'Clear')
            ]),
            h('div', {
                attrs: {
                    id: 'console__output'
                },
                domProps: {
                    innerHTML: this.outputBuffer
                }
            }),
            h('span', {
                attrs: {
                    id: 'console__input'
                },
            }, [
                h('input', {
                    domProps: {
                        value: this.inputBuffer
                    },
                    on: {
                        input: this.input
                    }
                }),
                h('input', {
                    attrs: { type: 'checkbox' },
                    domProps: { checked: this.enterBuffered },
                    on: {
                        input: this.onEnter
                    }
                }),
                h('label', 'Enter')
            ])
        ]);
    }
};