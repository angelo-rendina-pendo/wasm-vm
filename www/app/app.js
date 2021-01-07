import Menu from './menu/menu.js';
import Debugger from './debugger/debugger.js';
import Editor from './editor/editor.js';

export default {
    name: 'App',
    data() {
        return {
            view: '',
            sources: {},
            currentSource: null,
            autosave: null
        };
    },
    created() {
        this.loadStorage();
        this.doAutosave();
    },
    beforeDestroy() {
        if (this.autosave) {
            clearTimeout(autosave);
        }
    },
    methods: {
        doAutosave() {
            this.saveStorage();
            this.autosave = setTimeout(this.doAutosave, 2000);
        },
        saveStorage() {
            const names = Object.keys(this.sources);
            names.forEach(name => {
                localStorage.setItem(name, this.sources[name]);
            });
            localStorage.setItem('wasm-vm-current-source', this.currentSource);
            localStorage.setItem('wasm-vm-project', JSON.stringify(names));
        },
        loadStorage() {
            const project = localStorage.getItem('wasm-vm-project') || '[]';
            const names = JSON.parse(project);
            if (names.length > 0) {
                names.forEach(name => {
                    const source = localStorage.getItem(name) || '';
                    this.$set(this.sources, name, source);
                });
                this.currentSource = localStorage.getItem('wasm-vm-current-source') || '';
                if (this.sources[this.currentSource] === undefined) {
                    this.currentSource = names[0];
                }
            } else {
                this.currentSource = this.createNewSource();
            }
        },
        onSourceCreated(source = '') {
            this.currentSource = this.createNewSource();
            this.$set(this.sources, this.currentSource, source);
        },
        createNewSource(name = 'new-source.txt') {
            if (this.sources[name] === undefined) {
                this.$set(this.sources, name, '');
                return name;
            }
            let i = 1;
            while (true) {
                let pageName = `${i}-${name}`;
                if (this.sources[pageName] === undefined) {
                    this.$set(this.sources, pageName, '');
                    return pageName;
                }
                i++;
            }
        },
        onSourceImported(name, source) {
            if (this.sources[name] !== undefined) {
                this.$set(this.sources, name, source);
                this.currentSource = name;
            } else {
                this.currentSource = this.createNewSource(name);
                this.$set(this.sources, name, source);
            }
        },
        onSourceClosed(name) {
            const position = Object.keys(this.sources).indexOf(name);
            this.$delete(this.sources, name);
            if (name === this.currentSource) {
                const newKeyAtPosition = Object.keys(this.sources)[position];
                if (newKeyAtPosition) {
                    this.currentSource = newKeyAtPosition;
                } else {
                    if (position > 0) {
                        this.currentSource = Object.keys(this.sources)[position - 1];
                     } else {
                         this.currentSource = this.createNewSource();
                    }
                }
            }
        },
        onSourceSelected(name) {
            this.currentSource = name;
        },
        onSourceChanged(name, source) {
            this.$set(this.sources, name, source);
        },
        onSourceRenamed(name) {
            const source = this.sources[this.currentSource];
            this.$set(this.sources, name, source);
            this.$delete(this.sources, this.currentSource);
            this.currentSource = name;
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
        onDisassembled(source) {
            this.currentSource = this.createNewSource('disasm.txt');
            this.$set(this.sources, this.currentSource, source);
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
                    editorOpened: this.onEditorOpened
                },
                props: {
                    view: this.view
                }
            }),
            ...(this.view === 'debugger' ? [
                h(Debugger, {
                    ref: 'debugger',
                    on: {
                        disassembled: this.onDisassembled
                    }
                }),
            ] : []),
            ...(this.view === 'editor' ? [
                h(Editor, {
                    ref: 'editor',
                    props: {
                        sources: this.sources,
                        currentSource: this.currentSource
                    },
                    on: {
                        compiledToDebugger: this.onCompiledToDebugger,
                        sourceChanged: this.onSourceChanged,
                        sourceSelected: this.onSourceSelected,
                        sourceClosed: this.onSourceClosed,
                        sourceImported: this.onSourceImported,
                        sourceCreated: this.onSourceCreated,
                        sourceRenamed: this.onSourceRenamed
                    }
                }),
            ] : []),
        ]);
    }
};