export default {
    name: 'Menu',
    props: {
        view: {
            type: String,
            default: ''
        }
    },
    methods: {
        callOpenFileDialog() {
            const fileInput = this.$refs.debuggerOpenInput;
            fileInput.value = null;
            fileInput.click();
        },
        onFileChange(event) {
            const { files } = event.target;
            const file = files.length ? files.item(0) : null;
            this.$emit('fileOpened', file);
        },
        onOpenEditor() {
            this.$emit('editorOpened');
        }
    },
    render: function(h) {
        return h('div', [
            h('div', {
                attrs: { class: 'menu__section' },
            }, [
                h('span', {
                    class: {
                        'menu__section__header': true,
                        'active': this.view === 'debugger'
                    }
                }, 'Debugger'),
                h('button', {
                    on: { click: this.callOpenFileDialog }
                }, 'Open Binary'),
                h('input', {
                    ref: 'debuggerOpenInput',
                    attrs: {
                        style: 'display: none;',
                        type: 'file'
                    },
                    on: { change: this.onFileChange }
                })
            ]),
            h('div', {
                attrs: { class: 'menu__section' },
            }, [
                h('span', {
                    class: {
                        'menu__section__header': true,
                        'active': this.view === 'editor'
                    }
                }, 'Editor'),
                h('button', {
                    on: { click: this.onOpenEditor }
                }, 'View')
            ])
        ]);
    }
};