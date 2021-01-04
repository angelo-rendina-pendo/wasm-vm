export default {
    name: 'Dump',
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
            shownLines: 100
        };
    },
    computed: {
        lines() {
            this.refresh;
            let lines = [];
            const stackDepth = this.vm.stack.length;
            for(let i = 0; i < this.shownLines; i++) {
                if(i >= stackDepth) break;
                lines.push({
                    offset: i,
                    value: this.vm.stack[stackDepth - i - 1]
                });
            }
            return lines;
        }
    },
    methods: {
        getStackValue(offset) {
            const stackDepth = this.vm.stack.length;
            return this.vm.stack[stackDepth - offset - 1];
        }
    },
    render: function(h) {
        return h('div', [
            h('div', {
                attrs: { class: 'debugger__quadrant__title' }
            }, 'Stack'),
            h('div', {
                attrs: { id: 'dump__display__header' }
            }, [
                h('span', {
                    attrs: { class: 'dump__line__offset' }
                }, 'Offset'),
                h('span', 'Value'),
            ]),
            h('div', {
                attrs: { id: 'dump__display' }
            }, this.lines.map(line => {
                return h('div', [
                    h('span', {
                        attrs: { class: 'dump__line__offset' }
                    }, line.offset),
                    h('input', {
                        attrs: {
                            type: 'number',
                            min: '0',
                            max: '32767',
                            style: 'width: 80px;'
                        },
                        domProps: {
                            value: line.value
                        },
                        on: {
                            change: event => {
                                const value = parseInt(event.target.value);
                                if (!isNaN(value) && value >= 0 && value < 32768) {
                                    const stackDepth = this.vm.stack.length;
                                    this.vm.set_stack(stackDepth - line.offset - 1, value);
                                    this.$emit('refreshRequested');
                                }
                            },
                            blur: event => {
                                event.target.value = this.getStackValue(line.offset);
                            }
                        }
                    })
                ]);
            }))
        ]);
    }
};