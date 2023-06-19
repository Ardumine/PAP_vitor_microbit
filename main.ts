

//https://microsoft.github.io/jacdac-docs/clients/makecode/code/


//tirar musica e microfone
function Startup() {
    beep(100, 100);

    basic.showLeds(`
    . . . . .
    . . . . .
    # . # . #
    . # # # .
    # . # . #
    `, 100)
    serial.redirect(
        108,//laranja pino 8
        112, //amarelo  pino 12//AVISO ARDUINO
        9600
    )
    serial.setRxBufferSize(128)
    //serial.setTxBufferSize(128)

    //serial.redirectToUSB()
    //maqueenPlusV2.I2CInit()
    //maqueenPlusV2.setIndexColor(0,499999)
    basic.showLeds(`
     # . . . #
     . . # . .
     . . . . .
     # . # . #
     # . . . #
     `, 100)
    beep(500, 40);

}

Startup()

let separador_ln = serial.delimiters(Delimiters.NewLine);

function Motor1(vel: number) {
    if (vel > 0) {
        maqueenPlusV2.controlMotor(0, 0, vel)

    }
    else {
        maqueenPlusV2.controlMotor(0, 1, -vel)
    }

}

function Motor2(vel: number) {
    if (vel > 0) {
        maqueenPlusV2.controlMotor(1, 0, vel)

    }
    else {
        maqueenPlusV2.controlMotor(1, 1, -vel)
    }

}


//PARTE LINHA
//Branco = false
//Preto = true


let Limpeza_str = function (str: string) { return str.replace(separador_ln, "").replace("\r", "")}

let num_ant = 0;


function Mandar_dados_info_Arduino() {
    let dados_mandar_raw = maqueenPlusV2.readUltrasonic(113, 114).toString() + ";";


    for (let i = 0; i < 5; i++) {
        dados_mandar_raw += (Obter_sensor_linha(i) ? "0" : "1") + ";";
    }


    Mandar_dados_Arduino(dados_mandar_raw + Dados_rec_serial_cache.length + ";")
}



function Dados_recebidos_PC(dados_rec: string) {
    //São diretamente mandados para o arduino
    //beep();
    Mandar_dados_Arduino("de_pc" + dados_rec);
}

function beep(nota: number = 260, tmp: number = 50) {
    music.playTone(nota, tmp)
}

function Debug_arduino(txt: string) {
    Dados_recebidos_PC("deb_" + txt);
}

function Mandar_dados_PC(dados_mandar: string) {
    // let tempo_ant = control.millis();
    let dados_split = dados_mandar.split('');
    //beep(1000);
    //beep(1000);

    for (let i = 0; i < dados_split.length; i = i + 3) {
        bluetooth.uartWriteString(dados_split[i] + ((dados_split[i + 1] == undefined) ? "" : dados_split[i + 1])      /*Parte 2*/ + ((dados_split[i + 2] == undefined) ? "" : dados_split[i + 2]));//dados_split.[i + 1]
    }
    bluetooth.uartWriteString(separador_ln);
    // beep();
    //Debug_arduino((control.millis() - tempo_ant).toString());
}



function Mandar_dados_Arduino(dados_mandar: string) { //ant 0 e 1 //writeLine 20 // writestring 0
    // serial.writeLine(dados_mandar);
    //return;
    //beep(300);
    //let tempo_ant = control.millis();
    // dados_mandar.split('').forEach((letra, _) => {
    //     serial.writeString(letra);
    //     //beep();
    // })
    //beep(400);
    let dados_split = (dados_mandar).split('');

    for (let i = 0; i < dados_split.length; i = i + 3) {
        //serial.writeString(dados_split[i]);
        serial.writeString(dados_split[i] + ((dados_split[i + 1] == undefined) ? "" : dados_split[i + 1])      /*Parte 2*/ + ((dados_split[i + 2] == undefined) ? "" : dados_split[i + 2]));//dados_split.[i + 1]

        //pause(1);
    }
    //beep(500, 10);

    //serial.writeString(dados_mandar);
    serial.writeString(separador_ln);

    //basic.showNumber((control.millis() - tempo_ant),0);
    // beep(300);

}

function Obter_sensor_linha(num: number | MyEnumLineSensor): boolean {
    //Mandar_dados_PC(maqueenPlusV2.readLineSensorData(MyEnumLineSensor.SensorR2).toString());
    //return DFRobotMaqueenPlusV2.readLineSensorData(num) > 300;
    return maqueenPlusV2.readLineSensorState(num) == 1;

}



let conectado = false;

let separador_ble = "|";
let separador_ble_fim = ">";
let separador_ble_inicio = "<";
let dados_recs_ble = "";

bluetooth.onUartDataReceived(separador_ble, () => {
    if (conectado) {
        //let tempo_ant = control.millis();
        let string_rec_raw = bluetooth.uartReadUntil(separador_ble);
        let dados_rec_trans = Limpeza_str(string_rec_raw).replace(separador_ble_fim, "").replace(separador_ble, "").replace(separador_ble_inicio, "");


        //if (string_rec_raw.includes(separador_ble_inicio)) {//Se recebeu char de inicio de dados

        //}

        dados_recs_ble += dados_rec_trans;

        if (string_rec_raw.includes(separador_ble_fim)) {//Se recebeu char de fim de dados

            //Mandar_dados_PC(dados_recs_ble);
            bloquear_mandar_dados_serial = true
            //beep(600, 100);

            //pause(100);
            Motor1(0);
            Motor2(0);
            pause(100);
            Motor1(0);
            Motor2(0);

            //beep(600, 10);

            Dados_recebidos_PC(dados_recs_ble);
            dados_recs_ble = "";

            //beep(50, 10);
            pause(10);

            bloquear_mandar_dados_serial = false;

            //pause(100);

            //beep(100, 100);
            //if (dados_recs_ble.length != 0) {//}


        }


    }
})


let Dados_rec_serial_cache = [""];

serial.onDataReceived(separador_ln, () => {
    //while(bloquear_mandar_dados_serial){
    //   pause(1)
    //}
    let dados = serial.readLine();
    if (dados.length > 2) {
        Dados_rec_serial_cache.push(Limpeza_str(dados));
    }
    //basic.showString(Dados_recebidos_rw, 50);
})

function Plot(linha: number, valor: number, max: number) {
    let mape = Math.map(valor, 0, max, 0, 4);

    for (let x = 0; x < mape; x++) {
        led.plot(x, linha - 1)
    }
    for (let x = mape; x < 5; x++) {
        led.unplot(x, linha - 1)
    }
}
let bloquear_mandar_dados_serial = false;
basic.forever(() => {
    //Plot(5, Dados_rec_serial_cache.length, 8)
    //Plot(1, num_ant, 6)
    if (!bloquear_mandar_dados_serial) {
        //basic.showNumber(, 0);

        for (let i = 0; i < Dados_rec_serial_cache.length; i++) {


            if (!bloquear_mandar_dados_serial) {
                //pause(1);
                let Dados_recebidos_rw = Dados_rec_serial_cache[i];
                if (Dados_recebidos_rw == "info") {
                    //beep(-1, 10);
                    Mandar_dados_info_Arduino();


                }
                else if (Dados_recebidos_rw.includes("pr_pc")) { // Se msg é para pc

                    let msg_pra_recetor = Dados_recebidos_rw.replace("pr_pc", "");
                    Mandar_dados_PC(msg_pra_recetor);

                }
                else if (Dados_recebidos_rw.length < 2) {
                    //basic.showString(Dados_recebidos_rw,0);
                    //beep(700, 10);
                }
                else {
                    //beep(900, 10);
                    let Dados_recebidos_sep = Dados_recebidos_rw.split(";");


                    Motor1(parseInt(Dados_recebidos_sep[0]));
                    Motor2(parseInt(Dados_recebidos_sep[1]));
                    if (parseInt(Dados_recebidos_sep[2]) != num_ant) {
                        num_ant = parseInt(Dados_recebidos_sep[2]);

                    }
                }
                Dados_rec_serial_cache.splice(i, 1)
            }

        }

    }

})

bluetooth.onBluetoothConnected(function () {

    bluetooth.startUartService();
    Mandar_dados_PC("a");

    beep(100)
    beep(200)

    conectado = true;

})



bluetooth.onBluetoothDisconnected(function () {
    conectado = false;

    beep(100);
    beep(10);
    beep(300);
    beep(50);

})


beep(700)

