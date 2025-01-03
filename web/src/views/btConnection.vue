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
    } catch (error) {
        error.value = true
        console.error(error)
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
            <div class="wrapper">
                <p>Bluetooth is not supported</p>
            </div>
        </template>
        <template v-if="bluetooth.connected">
            <joystickController />
        </template>
    </v-main>
</template>
