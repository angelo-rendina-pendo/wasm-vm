import init from '../pkg/wasm_vm.js';
import App from './app/app.js';

(async function () {
    await init();
    new Vue({
        el: '#app',
        render: (h) => h(App)
    });
})();