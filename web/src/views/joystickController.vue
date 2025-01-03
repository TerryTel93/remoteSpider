<script setup lang="ts">
import { useSpiderStore } from '../stores/bluetooth.ts';
import nipplejs from 'nipplejs';
import { ref, onMounted } from 'vue';

const bluetooth = useSpiderStore()
const joystick = ref(null);

if (joystick.value) {
    debugger;
}

let lastDirection = 'motor_stop';

onMounted(() => {
    const manager = nipplejs.create({
        zone: joystick.value!,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        lockY: true,
        color: 'deeppink',

    });

    manager.on('move', async (evt, data) => {
        const angle = data.angle.degree;
        // Use the angle to determine direction
        if (angle > 45 && angle <= 135) {
            if (lastDirection != 'motor_forward') {
                lastDirection = 'motor_forward'
                await bluetooth.sendData('motor_forward');
            }
        } else if (angle > 225 && angle <= 315) {
            if (lastDirection != 'motor_backward') {
                lastDirection = 'motor_backward'
                await bluetooth.sendData('motor_backward');
            }

        }
    });
    manager.on('end', async () => {
        lastDirection = 'motor_stop';
        await bluetooth.sendData('motor_stop');
    });
});

async function ledToggle() {
    if (bluetooth.led) {
        return bluetooth.sendData('led_off');
    }
    return bluetooth.sendData('led_on');
}

// async function ledOff() {
//     return bluetooth.sendData('led_off');
// }
</script>

<template>
    <div class="wrapper">
        <v-btn :icon="bluetooth.led ? 'mdi-flashlight-off' : 'mdi-flashlight'" :active="false" size="x-large"
            @click="ledToggle"></v-btn>
        <div class="joystick" ref="joystick"></div>
    </div>
</template>

<style lang="css" scoped>
.wrapper {
    padding: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50vh;
    width: 50vh;
}

.joystick {
    position: absolute;
    width: 200px;
    height: 200px;
    right: 0;
    top: 25%;
}
</style>
