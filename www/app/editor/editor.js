import { compile } from '../../compiler.js';

export default {
    name: 'Editor',
    props: {
        source: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            status: 'Idle'
        };
    },
    methods: {
        onSourceInput(event) {
            this.$emit('sourceChanged', event.target.value);
        },
        openFile() {
            const fileInput = this.$refs.editorLoadInput;
            fileInput.value = null;
            fileInput.click();
        },
        onFileChange(event) {
            const { files } = event.target;
            const file = files.length ? files.item(0) : null;
            if (file) {
                const reader = new FileReader();
                reader.addEventListener('loadend', (event) => {
                    const buffer = event.target.result;
                    this.$emit('sourceChanged', buffer);
                    this.status = 'Loaded file';
                });
                reader.readAsText(file);
            }
        },
        saveFile() {
            let filename = this.$refs.saveFileInput.value || 'source.txt';
            this.status = 'Saved to file (in download)'
            let element = document.createElement('a');
            const blob = new Blob([this.source], {type: "text/plain"});
            const url = window.URL.createObjectURL(blob);
            element.setAttribute('href', url);
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            window.URL.revokeObjectURL(url);
        },
        compileToFile() {
            try {
                let filename = this.$refs.compileFileInput.value || 'compiled.bin';
                const bytecode = compile(this.source);
                this.status = 'Compiled to file (in download)'
                let element = document.createElement('a');
                const blob = new Blob([bytecode], {type: "octet/stream"});
                const url = window.URL.createObjectURL(blob);
                element.setAttribute('href', url);
                element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                this.status = error;
            }
        },
        compileToDebugger() {
            try {
                const bytecode = compile(this.source);
                this.$emit('compiledToDebugger', bytecode);
            } catch (error) {
                this.status = error;
            }
        },
        showExample() {
            const lines = [
                '# This is a comment, will be ignored',
                '',
                '# Defining some variables',
                '# They are allocated after the executable body',
                '.foo 42',
                '.values 0 5',
                '# .foo is the address in memory of the variable, initialised as 42',
                '# .values is the address in memory of the array of length 5, initialised as all 0',
                '# Variables must be defined with compile-time constants',
                '',
                '# Executable here',
                '# We populate the .values array with 5 increasing values, starting with .foo (42)',
                'SET r0 .values',
                'PUSH r0',
                'RMEM r0 .foo',
                ':loop',
                'GT r2 r1 4',
                'JT r2 :break',
                'ADD r3 .values r1',
                'WMEM r3 r0',
                'ADD r0 r0 1',
                'ADD r1 r1 1',
                'JMP :loop',
                ':break',
                '!print Done.',
                'HALT',
                '',
                '# Registers used:',
                '# r0: value to place',
                '# r1: loop counter',
                '# r2: loop exit flag',
                '# r3: pointer to array entry',
                '',
                '# After running the program, the values 42 to 46 should be loaded in memory from address .values',
                '# We pushed that address for clarity to the top of the stack for clarity'
            ];
            this.$emit('sourceChanged', lines.join('\n'));
        }
    },
    render: function(h) {
        return h('div', {
            attrs: { id: 'editor' }
        }, [
            h('textarea', {
                attrs: {
                    id: 'editor__text-area',
                    spellcheck: 'false'
                },
                domProps: {
                    value: this.source
                },
                on: {
                    input: this.onSourceInput
                }
            }),
            h('div', {
                attrs: { id: 'editor__toolbar' }
            }, [
                h('div', {
                    attrs: { class: 'editor__toolbar__header' }
                }, 'File'),
                h('button', {
                    on: { click: this.openFile }
                }, 'Load'),
                h('input', {
                    ref: 'editorLoadInput',
                    attrs: {
                        style: 'display: none;',
                        type: 'file'
                    },
                    on: { change: this.onFileChange }
                }),
                h('div', {
                    attrs: { class: 'editor__toolbar__target' }
                }, [
                    h('input', {
                        ref: 'saveFileInput',
                        attrs: { placeholder: 'File name' }
                    }),
                    h('button', {
                        on: { click: this.saveFile }
                    }, 'Save')
                ]),
                h('div', {
                    attrs: { class: 'editor__toolbar__header' }
                }, 'Actions'),
                h('button', {
                    on: { click: this.compileToDebugger }
                }, 'Compile to Debugger'),
                h('div', {
                    attrs: { class: 'editor__toolbar__target' }
                }, [
                    h('input', {
                        ref: 'compileFileInput',
                        attrs: { placeholder: 'File name' }
                    }),
                    h('button', {
                        on: { click: this.compileToFile }
                    }, 'Compile to File'),
                ]),
                h('div', {
                    attrs: { class: 'editor__toolbar__header' }
                }, 'Status'),
                h('textarea', {
                    attrs: { id: 'editor__toolbar__status' },
                    domProps: {
                        disabled: true,
                        value: this.status,
                        multiline: true
                    }
                }),
                h('div', {
                    attrs: { class: 'editor__toolbar__header' }
                }, 'Help'),
                h('div', {
                    attrs: { id: 'editor__toolbar__help' },
                }, [
                    h('div', 'Compiler syntax:'),
                    h('div', '"SET [op]..." for instruction'),
                    h('div', '"!macro [op]..." for macro'),
                    h('div', '":label" to define a label at that position'),
                    h('div', '".variable value [repeat]" to define a variable'),
                    h('div', '"# comment" for comment'),
                    h('div', '"?? value" to hardcode memory directly'),
                    h('div', 'Comments and empty lines are ignored'),
                    h('div', 'Remember to HALT at the end of main!'),
                    h('hr'),
                    h('div', 'Space separated operands:'),
                    h('div', '"1234" for immediate operand'),
                    h('div', '"r0" to "r7" for registers'),
                    h('div', '":label" for address of label'),
                    h('div', '".variable" for address of variable'),
                    h('hr'),
                    h('div', 'Variable definition:'),
                    h('div', '".foo value [repeat]"'),
                    h('div', '".foo" is the address of the variable'),
                    h('div', '"value" is the initial value of the variable'),
                    h('div', '"repeat" (optional) repeats the value - allocate array'),
                    h('hr'),
                    h('div', 'Available macros:'),
                    h('div', '"!print `String here`" translates to multiple OUTs'),
                    h('div', '"!println `String here`" !print and appends a new line'),
                    h('div', '"!neg <register> value" negates value to register'),
                    h('button', {
                        on: { click: this.showExample }
                    }, 'Display example')
                ]),
            ])
        ]);
    }
};