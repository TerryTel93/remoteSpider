
/// <reference types="web-bluetooth" />
import { defineStore } from "pinia"

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const useSpiderStore = defineStore('Spider', {
    state: () => ({
        led: false,
        motor_forward: 0,
        motor_backward: 0,
        _device: null as BluetoothDevice | null,
        _server: null as BluetoothRemoteGATTServer | null,
        _service: null as BluetoothRemoteGATTService | null,
        send: null as BluetoothRemoteGATTCharacteristic | null,
        get: null as BluetoothRemoteGATTCharacteristic | null,
        _sending: false,
        _queue: [] as { type: string, data: string | boolean | number }[],
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
            //TODO: add a loading spinner while connecting
            if (!navigator.bluetooth) {
                //TODO: show a message to the user that their browser does not support web bluetooth
                console.error('Web Bluetooth is not supported in this browser');
                return;
            }
            try {
                this._device = await navigator.bluetooth.requestDevice({ filters: [{ services: [0x1848] }] })
                this._server = await this._device.gatt!.connect();
                this._service = await this._server.getPrimaryService(0x1848);
                this.send = await this._service.getCharacteristic(0x2A6E);
                this.get = await this._service.getCharacteristic(0x2A6F);

                this._device.addEventListener('gattserverdisconnected', () => {
                    this.disconnect();
                });

                await this.getData();
            } catch (error: unknown) {
                if (error instanceof Error) {
                    if (error.name == 'NetworkError') {
                        //TODO: We need to tell the user that the network has been disconnected
                        return
                    }
                }

                //TODO: show a generic error message to the user
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

        async sendData(type: string, data: string | boolean | number, force = false) {
            if (this._sending) {
                if (force) {
                    this._queue.push({ type, data });
                }

                // if we are already sending data thats not important then we will ignore the current command
                return;
            }
            this._sending = true;
            try {
                await this.send!.writeValue(encoder.encode(`${type}:${data}`));
                await this.getData();
            } catch (err: unknown) {
                console.error('Failed to send data:', err);
            } finally {
                this._sending = false;
                const queue = this._queue.shift();
                if (queue) {
                    await this.sendData(queue.type, queue.data);
                }
            }
        },

        async getData() {
            if (!this.get) {
                return;
            }

            try {
                const data = await this.get!.readValue();
                const json = JSON.parse(decoder.decode(data));

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
                //TODO: show a message to the user something went wrong
                console.error(err);
            }

        }
    },
})