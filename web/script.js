class Bluetooth {
    constructor() {
        this.device;
        this.server;
        this.service;
        this.send;
        this.get;
    }

    async connect() {
        this.device = await navigator.bluetooth.requestDevice({ filters: [{ services: [0x1848] }] })
            .then(device => device.gatt.connect())
            .catch(error => { console.error(error); });
        this.server = await this.device.gatt.connect();
        this.service = await this.server.getPrimaryService(0x1848);
        this.send = await this.service.getCharacteristic(0x2A6E);
        this.get = await this.service.getCharacteristic(0x2A6F);
    }

    async send(data) {
        
        await this.send.writeValue(data);
    }

    async get() {
        return await this.get.readValue();
    }
}






