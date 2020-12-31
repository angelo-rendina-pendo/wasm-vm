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
                    h('span', line.value)
                ]);
            }))
        ]);
    }
};