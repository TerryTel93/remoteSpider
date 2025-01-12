<script setup lang="ts">
import { ref } from 'vue';
import { useSpiderStore } from '../stores/bluetooth.ts';
import joystickController from './joystickController.vue';


const bluetooth = useSpiderStore()
const error = ref(false)
async function setupBluetooth() {
    try {
        error.value = false
        await bluetooth.connect()
    } catch (error: any) {
        error.value = true
        console.error(error)
        //TODO: we need some error checking here and to show a snackbar for the user.
    }
}

async function disconnect() {
    await bluetooth.disconnect()
}
</script>
<template>
    <v-app-bar>
        <v-toolbar-title>Spider Remote</v-toolbar-title>
        <template v-if="bluetooth.connected" v-slot:append>
            <v-btn variant="flat" color="error" v-on:click="disconnect">
                Disconnect
            </v-btn>
        </template>
        <template v-if="!bluetooth.connected">
            <v-btn variant="flat" color="primary" v-on:click="setupBluetooth">
                Connect
            </v-btn>

        </template>
    </v-app-bar>
    <v-main>
        <template v-if="!bluetooth.isSupported">
            <div class="center">
                <p>Bluetooth is not supported</p>
            </div>
        </template>
        <template v-if="bluetooth.connected">
            <joystickController />
        </template>
        <template v-if="!bluetooth.connected && !error">
            <div class="center">
                <img src="../assets/spider.png" height="400px" alt="Spider" />
                <p>To connect, tap the button called "Connect" in the top right hand corner</p>
                <p>If you have trouble connecting, make sure your device's Bluetooth is turned on and the device is in
                    pairing mode.</p>
            </div>
        </template>
    </v-main>
</template>

<style scoped>
.center {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 30px;
}
</style>