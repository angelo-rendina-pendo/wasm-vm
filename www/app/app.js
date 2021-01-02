import Menu from './menu/menu.js';
import Debugger from './debugger/debugger.js';
import Editor from './editor/editor.js';

export default {
    name: 'App',
    data() {
        return {
            view: '',
            source: ''
        };
    },
    methods: {
        onSourceChanged(source) {
            this.source = source;
        },
        onFileOpened(file) {
            this.view = 'debugger';
            this.$nextTick(() => {
                this.$refs.debugger.onFileOpened(file);
            });
        },
        onEditorOpened() {
            this.view = 'editor';
        },
        onCompiledToDebugger(bytecode) {
            this.view = 'debugger';
            this.$nextTick(() => {
                this.$refs.debugger.onCompiledToDebugger(bytecode);
            });
        },
        onDisassembled() {
            this.source = this.$refs.debugger.disassemble();
            this.view = 'editor';
        }
    },
    render: function(h) {
        return h('div', {
            attrs: { id: 'app' },
        }, [
            h(Menu, {
                attrs: { id: 'menu' },
                on: {
                    fileOpened: this.onFileOpened,
                    editorOpened: this.onEditorOpened,
                    disassembled: this.onDisassembled
                },
                props: {
                    view: this.view
                }
            }),
            ...(this.view === 'debugger' ? [
                h(Debugger, {
                    ref: 'debugger'
                }),
            ] : []),
            ...(this.view === 'editor' ? [
                h(Editor, {
                    ref: 'editor',
                    props: {
                        source: this.source,
                    },
                    on: {
                        compiledToDebugger: this.onCompiledToDebugger,
                        sourceChanged: this.onSourceChanged
                    }
                }),
            ] : []),
        ]);
    }
};