import { getFrame } from '../vram.js';

export default {
    name: 'Display',
    data() {
        return {
            canvas: null,
            context: null
        };
    },
    props: {
        vm: {
            type: Object,
            default: null
        }
    },
    methods: {
        renderFrame() {
            const frame = getFrame(this.vm, 'MONOCHROME');
            for (let i = 0; i < 60; i++) {
                for (let j = 0; j < 64; j++) {
                    this.context.beginPath();
                    this.context.fillStyle = frame[60*i + j];
                    this.context.fillRect(j, i, 1, 1);
                    this.context.stroke();
                }
            }
            requestAnimationFrame(this.renderFrame);
        }
    },
    mounted() {
        this.canvas = this.$refs.displayCanvas;
        this.canvas.width = 60;
        this.canvas.height = 64;
        this.context = this.canvas.getContext('2d');
        this.renderFrame();
    },
    render: function(h) {
        return h('canvas', {
            attrs: { id: 'display__canvas' },
            ref: 'displayCanvas'
        })
    }
}