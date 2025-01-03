
import { defineStore } from "pinia"

const encoder = new TextEncoder();
const decoder = new TextDecoder();


export const useSpiderStore = defineStore('Spider', {
    state: () => ({
        led: false,
        motor_forward: false,
        motor_backward: false,
        _device: null as BluetoothDevice | null,
        _server: null as BluetoothRemoteGATTServer | null,
        _service: null as BluetoothRemoteGATTService | null,
        send: null as BluetoothRemoteGATTCharacteristic | null,
        get: null as BluetoothRemoteGATTCharacteristic | null,
        _sending: false,
        _queue: [] as [],
    }),
    getters: {
        connected: (state) => {
            return state._server?.connected && state._service ? true : false;
        },
        isSupported: () => {
            return navigator.bluetooth ? true : false;
        }
    },
    actions: {
        async connect() {
            if (!navigator.bluetooth) {
                console.error('Web Bluetooth is not supported in this browser');
                return;
            }
            try {
                this._device = await navigator.bluetooth.requestDevice({ filters: [{ services: [0x1848] }] })
                this._server = await this._device.gatt.connect();
                this._service = await this._server.getPrimaryService(0x1848);
                this.send = await this._service.getCharacteristic(0x2A6E);
                this.get = await this._service.getCharacteristic(0x2A6F);

                this._device.addEventListener('gattserverdisconnected', () => {
                    this.disconnect();
                });
            } catch (error) {
                if (error.name === 'NotFoundError') {
                    return;
                }

                console.error('Failed to connect to device:', error);
            }

        },

        async disconnect() {
            if (this._server) {
                await this._server.disconnect();
                this._device = null;
                this._server = null;
                this._service = null;
                this.send = null;
                this.get = null;
                this._sending = false;
                this._queue = [];
            }
        },

        async sendData(data: string) {
            if (this._sending) {
                console.log('Queueing data:', data);
                this._queue.push(data);
                return;
            }
            this._sending = true;
            try {
                await this.send.writeValue(encoder.encode(data));
                await this.getData();
            } finally {
                this._sending = false;
                if (this._queue.length > 0) {
                    await this.sendData(this._queue.shift());
                }
            }
        },

        async getData() {
            try {
                const data = await this.get.readValue()
                const json = JSON.parse(decoder.decode(data));
                console.log(json);
                if (json.led !== undefined) {
                    this.led = json.led;
                }
                if (json.motor_forward !== undefined) {
                    this.motor_forward = json.motor_forward;
                }
                if (json.motor_backward !== undefined) {
                    this.motor_backward = json.motor_backward;
                }
            } catch (err) {
                console.error(err);
            }

        }
    },
})