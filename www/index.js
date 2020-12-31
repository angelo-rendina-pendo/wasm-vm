import init from '../pkg/wasm_vm.js';
import Debugger from './debugger/debugger.js';

(async function () {
    await init();
    new Vue({
        el: '#app',
        render: (h) => h(Debugger)
    });
})();