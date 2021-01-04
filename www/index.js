import init from '../pkg/wasm_vm.js';
import App from './app/app.js';

(async function () {
    const wasm = await init();
    window.wasm = wasm;
    new Vue({
        el: '#app',
        render: (h) => h(App)
    });
})();