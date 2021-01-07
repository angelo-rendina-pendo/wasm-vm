export default {
    name: 'Pad',
    props: {
        state: {
            type: Number,
            default: 0,
        }
    },
    computed: {
        keys() {
            return ['w', 'a', 's', 'd', 'k', 'l'];
        }
    },
    methods: {
        onKeyDown(event) {
            const key = event.key.toLowerCase();
            const keyIndex = this.keys.indexOf(key);
            if (keyIndex > -1) {
                const keyMask = 1 << keyIndex;
                this.$emit('padStateChanged', this.state | keyMask);
            }
        },
        onKeyUp(event) {
            const key = event.key.toLowerCase();
            const keyIndex = this.keys.indexOf(key);
            if (keyIndex > -1) {
                const keyMask = 1 << keyIndex;
                this.$emit('padStateChanged', this.state & ~keyMask);
            }
        },
        onFocus() {
            this.$emit('padStateChanged', 0);
        },
        isPadButtonDown(key) {
            const keyIndex = this.keys.indexOf(key);
            if (keyIndex > -1) {
                const keyMask = 1 << keyIndex;
                return (this.state & keyMask) > 0;
            }
        }
    },
    render: function(h) {
        return h('div', {
            attrs: {
                tabindex: '0'
            },
            on: {
                keydown: this.onKeyDown,
                keyup: this.onKeyUp,
                focus: this.onFocus
            }
        }, [
            h('span', {
                attrs: { style: 'position: absolute; right: 50%; top: 0;' }
            }, this.state),
            h('div', {
                attrs: { id: 'pad' }
            }, this.keys.map(key => {
                return h('div', {
                    attrs: { id: `pad__${key}` },
                    class: {
                        'pad__button': true,
                        active: this.isPadButtonDown(key)
                    }
                }, key.toUpperCase())
            }))
        ]);
    }
}