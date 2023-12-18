/**
 * 定义MyBlock指令块
 */
//% weight=11 color=#99CC00 icon="\uf005" block="HexBlock"
namespace HexBlock {
    let delay_value: number;
    delay_value = 200;

    /**
    * 电机接口列表
    */
    export enum MotorList {
        //% block="M1"
        M1,
        //% block="M2"
        M2,
        //% block="M3"
        M3,
        //% block="M4"
        M4,
        //% block="M5"
        M5,
        //% block="M6"
        M6
    }

    /**
    * 电机转向列表
    */
    export enum MDirList {
        //% block="顺时针"
        D1,
        //% block="逆时针"
        D2
    }

    export function iicSendData(addr: number, data1: number, data2: number, data3: number, data4: number, data5: number): void {
        let databuf = Buffer.create(5);
        databuf[0] = data1;
        databuf[1] = data2;
        databuf[2] = data3;
        databuf[3] = data4;
        databuf[4] = data5;

        pins.i2cWriteBuffer(addr, databuf, false);

        control.waitMicros(delay_value);
    }

    /**
     * @param ch 通道, eg: 1
     */
    //% block="通用IO口 %ch 输出数字信号 %level"
    //% weight=3
    //% ch.min=1 ch.max=8
    //% level.min=0 level.max=1
    export function gpioOut(ch: number, level: number): void {
        iicSendData(43, 2, ch - 1, 0, level, 0);
    }

    /**
     * @param ch 通道, eg: 1
     */
    //% block="读取通用IO口 %ch 数字信号"
    //% weight=2
    //% ch.min=1 ch.max=8
    export function gpioIn(ch: number): number {
        let a = 0
        switch(ch) {
            case 1: a = 1; break;
            case 2: a = 2; break;
            case 3: a = 4; break;
            case 4: a = 8; break;
            case 5: a = 16; break;
            case 6: a = 32; break;
            case 7: a = 64; break;
            case 8: a = 128; break;
            default: break;
        }
        iicSendData(43, 6, a, 0, 0, 0);
        iicSendData(43, 1, 2, 0, 0, 0);
        return 0
    }

    //% block="停止所有电机"
    //% weight=4
    export function stopAllMotor(): void {
        iicSendData(43, 7, 0, 0, 0, 0);
    }

    //% block="电机 %ch 方向 %direction 速度 %speed"
    //% speed.min=0 speed.max=100
    //% weight=5
    export function setMotor(motor: MotorList, direction: MDirList, speed: number): void {
        switch(motor) {
            case MotorList.M1:
                if(direction == MDirList.D1) {
                    iicSendData(43, 5, 2, 0, 3, speed);
                }else if (direction == MDirList.D2) {
                    iicSendData(43, 5, 2, speed, 3, 0);
                }
                break;
            case MotorList.M2:
                if(direction == MDirList.D1) {
                    iicSendData(43, 5, 0, 0, 1, speed);
                }else if (direction == MDirList.D2) {
                    iicSendData(43, 5, 0, speed, 1, 0);
                }
                break;
            case MotorList.M3:
                if(direction == MDirList.D1) {
                    iicSendData(43, 5, 14, 0, 15, speed);
                }else if (direction == MDirList.D2) {
                    iicSendData(43, 5, 14, speed, 15, 0);
                }
                break;
            case MotorList.M4:
                if(direction == MDirList.D1) {
                    iicSendData(43, 5, 12, 0, 13, speed);
                }else if (direction == MDirList.D2) {
                    iicSendData(43, 5, 12, speed, 13, 0);
                }
                break;
            case MotorList.M5:
                if(direction == MDirList.D1) {
                    iicSendData(43, 5, 6, 0, 7, speed);
                }else if (direction == MDirList.D2) {
                    iicSendData(43, 5, 6, speed, 7, 0);
                }
                break;
            case MotorList.M6:
                if(direction == MDirList.D1) {
                    iicSendData(43, 5, 4, 0, 5, speed);
                }else if (direction == MDirList.D2) {
                    iicSendData(43, 5, 4, speed, 5, 0);
                }
                break;
            default:
                break;
        }
    }

    /**
     * 以下为PS2无线遥控手柄相关代码
     */
    const rbits = hex`
    008040C020A060E0109050D030B070F0088848C828A868E8189858D838B878F8
    048444C424A464E4149454D434B474F40C8C4CCC2CAC6CEC1C9C5CDC3CBC7CFC
    028242C222A262E2129252D232B272F20A8A4ACA2AAA6AEA1A9A5ADA3ABA7AFA
    068646C626A666E6169656D636B676F60E8E4ECE2EAE6EEE1E9E5EDE3EBE7EFE
    018141C121A161E1119151D131B171F1098949C929A969E9199959D939B979F9
    058545C525A565E5159555D535B575F50D8D4DCD2DAD6DED1D9D5DDD3DBD7DFD
    038343C323A363E3139353D333B373F30B8B4BCB2BAB6BEB1B9B5BDB3BBB7BFB
    078747C727A767E7179757D737B777F70F8F4FCF2FAF6FEF1F9F5FDF3FBF7FFF`

    /**
     * Reverse buffer of bits
     * @param b buffer to be reversed
     */
    export function rbuffer(b: Buffer): Buffer {
        let output = pins.createBuffer(b.length);
        for(let i = 0; i < b.length; i++) {
            let n = b[i]
            output[i] = rbit(n)
        }
        return output
    }

    /**
     * Reverse bit
     * @param value to be reversed
     */
    export function rbit(value: number): number {
        return rbits[value] || 0x00;
    }
    
    let chipSelect = DigitalPin.P2
    // let chipSelect = DigitalPin.P0
    pins.digitalWritePin(chipSelect, 1)

    pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
    // pins.spiPins(DigitalPin.P1, DigitalPin.P8, DigitalPin.P12)
    pins.spiFormat(8, 3)
    pins.spiFrequency(250000)
    
    let pad = pins.createBuffer(6)
    let connected = false

    const poll_cmd = hex
        `014200000000000000`

    function send_command(transmit: Buffer): Buffer {
        // 处理位顺序
        transmit = rbuffer(transmit)

        let receive = pins.createBuffer(transmit.length);

        pins.digitalWritePin(chipSelect, 0);

        // 实际发送命令
        for(let i = 0; i < transmit.length; i++) {
            receive[i] = pins.spiWrite(transmit[i]);
        }
        pins.digitalWritePin(chipSelect, 1)

        // 处理位顺序
        receive = rbuffer(receive)

        return receive
    }

    export enum PS2Button {
        //% blockId="Left" block="向左方向键"
        Left,
        //% blockId="Down" block="向下方向键"
        Down,
        //% blockId="Right" block="向右方向键"
        Right,
        //% blockId="Up" block="向上方向键"
        Up,
        //% blockId="Start" block="开始(Start)按键"
        Start,
        //% blockId="Analog_Left" block="左侧摇杆按下"
        Analog_Left,
        //% blockId="Analog_Right" block="右侧摇杆按下"
        Analog_Right,
        //% blockId="Select" block="选择(Select)按键"
        Select,
        //% blockId="Square" block="正方形(□)按键"
        Square,
        //% blockId="Cross" block="叉型(×)按键"
        Cross,
        //% blockId="Circle" block="圆型(○)按键"
        Circle,
        //% blockId="Triangle" block="三角形(△)按键"
        Triangle,
        //% blockId="R1" block="R1按键"
        R1,
        //% blockId="L1" block="L1按键"
        L1,
        //% blockId="R2" block="R2按键"
        R2,
        //% blockId="L2" block="L2按键"
        L2,
        //% blockId="Buttons" block="按键(空缺)"
        Buttons,
        //% blockId="RX" block="右侧摇杆X的值"
        RX,
        //% blockId="RY" block="右侧摇杆Y的值"
        RY,
        //% blockId="LX" block="左侧摇杆x的值"
        LX,
        //% blockId="LY" block="左侧摇杆Y的值"
        LY,
    };

    //% blockId=robotbit_button_pressed block="读取PS2手柄|%b|状态"
    //% weight=1
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function button_pressed(b: PS2Button): number {
        if (!connected) return 0x00

        switch(b) {
            case PS2Button.Left:
                return pad[0] & 0x80 ? 0 : 1;
            case PS2Button.Down:
                return pad[0] & 0x40 ? 0 : 1;
            case PS2Button.Right:
                return pad[0] & 0x20 ? 0 : 1;
            case PS2Button.Up:
                return pad[0] & 0x10 ? 0 : 1;
            case PS2Button.Start:
                return pad[0] & 0x08 ? 0 : 1;
            case PS2Button.Analog_Left:
                return pad[0] & 0x04 ? 0 : 1;
            case PS2Button.Analog_Right:
                return pad[0] & 0x02 ? 0 : 1;
            case PS2Button.Select:
                return pad[0] & 0x01 ? 0 : 1;
            case PS2Button.Square:
                return pad[1] & 0x80 ? 0 : 1;
            case PS2Button.Cross:
                return pad[1] & 0x40 ? 0 : 1;
            case PS2Button.Circle:
                return pad[1] & 0x20 ? 0 : 1;
            case PS2Button.Triangle:
                return pad[1] & 0x10 ? 0 : 1;
            case PS2Button.R1:
                return pad[1] & 0x08 ? 0 : 1;
            case PS2Button.L1:
                return pad[1] & 0x04 ? 0 : 1;
            case PS2Button.R2:
                return pad[1] & 0x02 ? 0 : 1;
            case PS2Button.L2:
                return pad[1] & 0x01 ? 0 : 1;
            case PS2Button.Buttons:
                return ~((pad[1] << 8) | pad[0]) & 0xffff;
            case PS2Button.RX:
                return pad[2] - 0x80;
            case PS2Button.RY:
                return pad[3] - 0x80;
            case PS2Button.LX:
                return pad[4] - 0x80;
            case PS2Button.LY:
                return pad[5] - 0x80;
        }
        return 0;
    }

    function poll(): boolean {
        let buf = send_command(poll_cmd)
        if(buf[2] != 0x5a) {
            return false;
        }

        for(let i = 0; i < 6; i++) {
            pad[i] = buf[3 + i];
        }

        connected = true

        return true
    }

    basic.forever(function () {
        poll();
    })
}