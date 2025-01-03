const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class Bluetooth {
    device: BluetoothDevice;
    server: BluetoothRemoteGATTServer;
    service: BluetoothRemoteGATTService;
    send: BluetoothRemoteGATTCharacteristic;
    get: BluetoothRemoteGATTCharacteristic;

    connected(): boolean {
        if (this.server) {
            return this.server.connected
        }
        return false
    }

    async connect() {
        const device = await navigator.bluetooth.requestDevice({ filters: [{ services: [0x1848] }] })
        this.server = await device.gatt.connect();
        this.service = await this.server.getPrimaryService(0x1848);
        this.send = await this.service.getCharacteristic(0x2A6E);
        this.get = await this.service.getCharacteristic(0x2A6F);

        this.get.addEventListener('characteristicvaluechanged', (event) => {
            console.log(decoder.decode(event.target.value));
        });
        device.addEventListener('gattserverdisconnected', () => {
            if (!this.server.connected) {
                console.log('Bluetooth device disconnected!');
            }
        });
    }

    async sendData(data: string) {
        await this.send.writeValue(encoder.encode(data));
    }

    async getData() {
        const data = await this.get.readValue()
        return (decoder.decode(data))
    }
}