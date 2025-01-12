# RemoteSpider

## Introduction

RemoteSpider is a project designed to run on a Raspberry Pi Pico and the web. This project was build to convert a basic motor circuit into a remove control via bluetooth. This guide will help you install and set up the main file on your Raspberry Pi Pico.

## Requirements

- Raspberry Pi Pico
- USB cable
- Computer with internet access
- Somewhere to host the website (Please note that bluetooth need HTTPS or HTTP on localhost)

## Installation

1. Download the Project:
    - Clone the repository to your local machine:

      ```sh
      git clone https://github.com/TerryTel93/remoteSpider.git
      ```

    - Navigate to the project directory:

      ```sh
      cd remoteSpider
      ```

2. Install MicroPython on the Raspberry Pi Pico:
    - Download the latest MicroPython UF2 file from the official MicroPython website.
    - Connect your Raspberry Pi Pico to your computer while holding the BOOTSEL button.
    - Drag and drop the UF2 file onto the RPI-RP2 drive that appears.

3. Install Thonny IDE:
    - Download and install Thonny from [thonny.org](https://thonny.org).
    - Open Thonny and select "MicroPython (Raspberry Pi Pico)" as the interpreter.
    - Connect your Raspberry Pi Pico to your computer using a USB cable.
    - In Thonny, go to `File > Open` and navigate to the main file in the `remoteSpider` directory.
    - Click the `Run` button to upload and run the code on your Pico.
"""

4. Eject the Pico:
    - Safely eject the Pico from your computer.

5. Run the Program:
    - Disconnect and reconnect the Pico to your computer (without holding the BOOTSEL button).
    - The program should start running automatically.

## Pin layout

| Pin | Function |
|-----|----------|
| 19 | LED positive cable (Connect ground cable to ground ) |
| 21 | Motor forwards (Connected to H Bridge) |
| 20 | Motor backwards (Connected to H Bridge) |

## Setup the Webapp

Read the setup guide for the web application [here](./web/README.md).
