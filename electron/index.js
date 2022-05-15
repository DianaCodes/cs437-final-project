document.onkeydown = updateKey;
document.onkeyup = resetKey;

var server_port = 65482;
var server_addr = "10.0.0.10";   // the IP address of your Raspberry PI

window.onload = function(){
    // update data for every 50ms
    setInterval(function(){
        // get image from python server
        client('Stats');
    }, 50);
}

function client(param){
    const net = require('net');
    
    const client = net.createConnection({ port: server_port, host: server_addr }, () => {
        // 'connect' listener.
        console.log('connected to server!');
        // send the message
        //client.write(`${input}\r\n`);
        client.write(param);
    });
    
    // get the data from the server
    client.on('data', (data) => {
        // TODO: return list of data for stats
        // TODO: set text of the stats to returned list elements
        data = decodeURIComponent(data);
        data = data.split(',');
        console.log(data);
        document.getElementById("direction").innerHTML = data[1];
        document.getElementById("speed").innerHTML = data[0];
        document.getElementById("bluetooth").innerHTML = data[2];
        console.log(data.toString());
        client.end();
        client.destroy();
    });

    client.on('end', () => {
        console.log('disconnected from server');
    });
}

// for detecting which key is been pressed w,a,s,d
function updateKey(e) {
    e = e || window.event;

    if (e.keyCode == '87') {
        // up (w)
        document.getElementById("upArrow").style.color = "green";
        send_data("87");
    }
    else if (e.keyCode == '83') {
        // down (s)
        document.getElementById("downArrow").style.color = "green";
        send_data("83");
    }
    else if (e.keyCode == '65') {
        // left (a)
        document.getElementById("leftArrow").style.color = "green";
        send_data("65");
    }
    else if (e.keyCode == '68') {
        // right (d)
        document.getElementById("rightArrow").style.color = "green";
        send_data("68");
    }
}

// reset the key to the start state 
function resetKey(e) {
    e = e || window.event;

    document.getElementById("upArrow").style.color = "grey";
    document.getElementById("downArrow").style.color = "grey";
    document.getElementById("leftArrow").style.color = "grey";
    document.getElementById("rightArrow").style.color = "grey";
}

function update_data(){
    client('Stats');
}
