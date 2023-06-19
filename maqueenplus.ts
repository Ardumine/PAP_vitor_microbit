


//Line sensor selection
enum MyEnumLineSensor {
    //% block="L1"
    SensorL1,
    //% block="M"
    SensorM,
    //% block="R1"
    SensorR1,
    //% block="L2"
    SensorL2,
    //% block="R2"
    SensorR2,
};

/**
 * Custom graphic block
 */
//% weight=100 color=#0fbc11 icon="\uf067" block="maqueenPlusV2"
namespace maqueenPlusV2 {

    //Motor selection enumeration
    

    const I2CADDR = 0x10;
    const ADC0_REGISTER = 0X1E;
    const ADC1_REGISTER = 0X20;
    const ADC2_REGISTER = 0X22;
    const ADC3_REGISTER = 0X24;
    const ADC4_REGISTER = 0X26;
    const LEFT_LED_REGISTER = 0X0B;
    const RIGHT_LED_REGISTER = 0X0C;
    const LEFT_MOTOR_REGISTER = 0X00;
    const RIGHT_MOTOR_REGISTER = 0X02;
    const LINE_STATE_REGISTER = 0X1D;
    const VERSION_CNT_REGISTER = 0X32;
    const VERSION_DATA_REGISTER = 0X33;


    let state: number;

    /**
     *  Init I2C until success
     */

    //% weight=100
    //%block="initialize via I2C until success"
    export function I2CInit(): void {
        let Version_v = 0;
        pins.i2cWriteNumber(I2CADDR, 0x32, NumberFormat.Int8LE);
        Version_v = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        while (Version_v == 0) {
            basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
                `, 10)
            basic.clearScreen()
            pins.i2cWriteNumber(0x10, 0x32, NumberFormat.Int8LE);
            Version_v = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        }
        basic.showLeds(`
                . . . . .
                . . . . #
                . . . # .
                # . # . .
                . # . . .
                `, 10)
        basic.clearScreen()
    }

    /**
     * Control motor module running
     * @param emotor Motor selection enumeration
     * @param edir   Motor direction selection enumeration
     * @param speed  Motor speed control, eg:100
     */

    //% block="set %emotor direction %edir speed %speed"
    //% speed.min=0 speed.max=255
    //% weight=99
    export function controlMotor(emotor: number, edir: number, speed: number): void {
        switch (emotor) {
            case 0:
                let leftBuffer = pins.createBuffer(3);
                leftBuffer[0] = LEFT_MOTOR_REGISTER;
                leftBuffer[1] = edir;
                leftBuffer[2] = speed;
                pins.i2cWriteBuffer(I2CADDR, leftBuffer);
                break;
            case 1:
                let rightBuffer = pins.createBuffer(3);
                rightBuffer[0] = RIGHT_MOTOR_REGISTER;
                rightBuffer[1] = edir;
                rightBuffer[2] = speed;
                pins.i2cWriteBuffer(I2CADDR, rightBuffer);
                break;
            default:
                break;
        }
    }

 

    

    /**
     * Get the state of the patrol sensor
     * @param eline Select the inspection sensor enumeration
     */

    //% block="read line sensor %eline state"
    //% weight=96
    export function readLineSensorState(eline: MyEnumLineSensor): number {
        pins.i2cWriteNumber(I2CADDR, LINE_STATE_REGISTER, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE)
        let state;
        switch (eline) {
            case MyEnumLineSensor.SensorL1:
                state = (data & 0x08) == 0x08 ? 1 : 0;
                break;
            case MyEnumLineSensor.SensorM:
                state = (data & 0x04) == 0x04 ? 1 : 0;
                break;
            case MyEnumLineSensor.SensorR1:
                state = (data & 0x02) == 0x02 ? 1 : 0;
                break;
            case MyEnumLineSensor.SensorL2:
                state = (data & 0x10) == 0X10 ? 1 : 0;
                break;
            default:
                state = (data & 0x01) == 0x01 ? 1 : 0;
                break;
        }
        return state;
    }

    /**
     * The ADC data of the patrol sensor is obtained
     * @param eline Select the inspection sensor enumeration
     */

    //% block="read line sensor %eline  ADC data"
    //% weight=95
    export function readLineSensorData(eline: MyEnumLineSensor): number {
        let data;
        switch (eline) {
            case MyEnumLineSensor.SensorR2:
                pins.i2cWriteNumber(I2CADDR, ADC0_REGISTER, NumberFormat.Int8LE);
                let adc0Buffer = pins.i2cReadBuffer(I2CADDR, 1);
                data = adc0Buffer[1] << 8 | adc0Buffer[0]
                break;
            case MyEnumLineSensor.SensorR1:
                pins.i2cWriteNumber(I2CADDR, ADC1_REGISTER, NumberFormat.Int8LE);
                let adc1Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc1Buffer[1] << 8 | adc1Buffer[0];
                break;
            case MyEnumLineSensor.SensorM:
                pins.i2cWriteNumber(I2CADDR, ADC2_REGISTER, NumberFormat.Int8LE);
                let adc2Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc2Buffer[1] << 8 | adc2Buffer[0];
                break;
            case MyEnumLineSensor.SensorL1:
                pins.i2cWriteNumber(I2CADDR, ADC3_REGISTER, NumberFormat.Int8LE);
                let adc3Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc3Buffer[1] << 1 | adc3Buffer[0];
                break;
            default:
                pins.i2cWriteNumber(I2CADDR, ADC4_REGISTER, NumberFormat.Int8LE);
                let adc4Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc4Buffer[1] << 8 | adc4Buffer[0];
                break;

        }
        return data;
    }


    export function readUltrasonic(trig: DigitalPin, echo: DigitalPin): number {
        let data;
        pins.digitalWritePin(trig, 1);
        basic.pause(1);
        pins.digitalWritePin(trig, 0)
        if (pins.digitalReadPin(echo) == 0) {
            pins.digitalWritePin(trig, 0);
            pins.digitalWritePin(trig, 1);
            basic.pause(20);
            pins.digitalWritePin(trig, 0);
            data = pins.pulseIn(echo, PulseValue.High, 500 * 58);
        } else {
            pins.digitalWritePin(trig, 1);
            pins.digitalWritePin(trig, 0);
            basic.pause(20);
            pins.digitalWritePin(trig, 0);
            data = pins.pulseIn(echo, PulseValue.High, 500 * 58)
        }
        data = data / 59;
        if (data <= 0)
            return 0;
        if (data > 500)
            return 500;
        return Math.round(data);
    }

    
}


