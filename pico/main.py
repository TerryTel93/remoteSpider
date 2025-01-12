import aioble
import bluetooth
from machine import ADC, Pin, PWM
import asyncio
import json

led = Pin(19, Pin.OUT)
motorForward = PWM(Pin(21, Pin.OUT))
motorBackward = PWM(Pin(20, Pin.OUT))

# Set PWM frequency
motorForward.freq(50)
motorBackward.freq(50)


# Define UUIDs for the service and characteristics
_SERVICE_UUID = bluetooth.UUID(0x1848)
_WRITE_CHARACTERISTIC_UUID = bluetooth.UUID(0x2A6E)
_READ_CHARACTERISTIC_UUID = bluetooth.UUID(0x2A6F)

IAM = "Spider"

# Bluetooth parameters
BLE_NAME = f"{IAM}"  # Dynamic name for the device
BLE_SVC_UUID = _SERVICE_UUID
BLE_APPEARANCE = 0x0300
BLE_ADVERTISING_INTERVAL = 1000

spider_status = {"led": True, "motor_forward": 0, "motor_backward": 0}

# state variables
message_count = 0


def encode_message():
    """Encode a message to bytes."""
    message = json.dumps(spider_status)
    return message.encode("utf-8")


def decode_message(message):
    """Decode a message from bytes."""
    return message.decode("utf-8")


async def send_data_task(connection, write_characteristic):
    global spider_status, message_count
    """Send data to the central device."""
    while True:
        try:
            write_characteristic.write(encode_message())  # Peripheral writes data here
            await asyncio.sleep_ms(10)
            continue
        except Exception as e:
            print(f"Error while sending data: {e}")
            continue


async def receive_data_task(read_characteristic):
    """Receive data from the central device."""
    while True:
        try:
            # This blocks until new data is available
            data = read_characteristic.read()

            if data:
                msg = decode_message(data)
                command = msg.split(":")
                set_action(command[0], command[1])
                continue
            await asyncio.sleep_ms(10)
        except Exception as e:
            print(f"Error receiving data: {e}")
            break


async def disconnected(connection):
    await connection.disconnected()
    machine.reset()


def set_values():
    if spider_status["led"] == True:
        led.on()
    elif spider_status["led"] == False:
        led.off()
    if spider_status["motor_backward"] > 0:
        set_motor_speed(spider_status["motor_backward"], "backward")
    if spider_status["motor_forward"] > 0:
        set_motor_speed(spider_status["motor_forward"], "forward")
    if spider_status["motor_backward"] == 0 and spider_status["motor_forward"] == 0:
        set_motor_speed(0, "forward")


def set_motor_speed(percentage, direction):
    """Sets the motor speed based on percentage (0-100) and direction."""
    if 0 <= percentage <= 100:
        duty_cycle = int((percentage / 100) * 65535)

        if direction == "forward":
            motorForward.duty_u16(duty_cycle)
            motorBackward.duty_u16(0)  # Complementary duty cycle
        elif direction == "backward":
            motorForward.duty_u16(0)  # Complementary duty cycle
            motorBackward.duty_u16(duty_cycle)
        else:
            print("Invalid direction. Use 'forward' or 'backward'")
    else:
        print("Percentage should be between 0 and 100")


def set_action(command, data):
    global led, spider_status

    if command == "led":
        if data == "true":
            spider_status["led"] = True
        elif data == "false":
            spider_status["led"] = False
    elif command == "motor_forward":
        spider_status["motor_backward"] = 0
        spider_status["motor_forward"] = int(data)
    elif command == "motor_backward":
        spider_status["motor_forward"] = 0
        spider_status["motor_backward"] = int(data)
    elif command == "motor_stop":
        spider_status["motor_forward"] = 0
        spider_status["motor_backward"] = 0

    set_values()


async def setup():
    set_values()

    # Set up the Bluetooth service and characteristics
    ble_service = aioble.Service(BLE_SVC_UUID)

    # Characteristic for the central to write
    write_characteristic = aioble.Characteristic(
        ble_service, _WRITE_CHARACTERISTIC_UUID, read=True, write=True, capture=False
    )

    # Characteristic for the peripheral to write
    read_characteristic = aioble.Characteristic(
        ble_service, _READ_CHARACTERISTIC_UUID, read=True, write=True, capture=False
    )

    aioble.register_services(ble_service)

    print(f"{BLE_NAME} starting to advertise")

    while True:
        async with await aioble.advertise(
            BLE_ADVERTISING_INTERVAL,
            name=BLE_NAME,
            services=[BLE_SVC_UUID],
            appearance=BLE_APPEARANCE,
        ) as connection:

            # Create tasks for sending and receiving data
            tasks = [
                asyncio.create_task(send_data_task(connection, read_characteristic)),
                asyncio.create_task(receive_data_task(write_characteristic)),
                asyncio.create_task(disconnected(connection)),
            ]
            await asyncio.gather(*tasks)


asyncio.run(setup())
