export default {
    name: 'Menu',
    methods: {
        callOpenFileDialog() {
            document.getElementById('menu__file-input').click();
        },
        onFileChange(event) {
            const { files } = event.target;
            const file = files.length ? files.item(0) : null;
            this.$emit('opened', file);
        }
    },
    render: function(h) {
        return h('div', [
            h('button', {
                on: { click: this.callOpenFileDialog }
            }, 'Open'),
            h('input', {
                attrs: {
                    id: 'menu__file-input',
                    type: 'file'
                },
                on: { change: this.onFileChange }
            })
        ]);
    }
};