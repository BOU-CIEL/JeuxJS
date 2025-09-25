'use strict';

console.log('TP CIEL');


/*  *********************** Serveur Web ***************************   */
// 
var portServ = 80;
var express = require('express');
var exp = express();
exp.use(express.static(__dirname + '/www'));

class CQr {
    constructor() {
        this.question = '?';
        this.bonneReponse = false;
        this.joueurs = 'username';
    }
    GetRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    NouvelleQuestion() {
        var x = this.GetRandomInt(11);
        var y = this.GetRandomInt(11);
        question = x + '*' + y + ' =  ?';
        bonneReponse = x * y;
        aWss.broadcast(question);
    }
    TraiterReponse(wsClient, message, req) {
        console.log('De %s %s, message :%s', req.connection.remoteAddress, req.connection.remotePort, message); 
        var mess = JSON.parse(message);
        if (mess.reponse == this.bonneReponse) {
            this.question = "Bonne reponse de " + mess.nom;
        }
        else {
            this.question = "Mauvaise reponse de " + mess.nom;
        }
        this.EnvoyerResultatDiff();
        setTimeout(() => {  //affichage de la question 3s après 
            this.NouvelleQuestion();
        }, 3000); 
    }
    EnvoyerResultatDiff() {
        var messagePourLesClients = {
            question: this.question
        };
        aWss.broadcast(JSON.stringify(messagePourLesClients));
    }
} 
var jeuxQr = new CQr; 


exp.get('/', function (req, res) {
    console.log('Reponse a un client');
    res.sendFile(__dirname + '/www/textchat.html');
});

exp.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Erreur serveur express');
});


/*  *************** serveur WebSocket express *********************   */
// 
var expressWs = require('express-ws')(exp);

// Connexion des clients à la WebSocket /echo et evenements associés 
exp.ws('/echo', function (ws, req) {

    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);   

    ws.on('message', function (message) {
        console.log('De %s %s, message :%s', req.connection.remoteAddress,
            req.connection.remotePort, message);
        message = ws._socket._peername.address + ' : ' + message; 
        aWss.broadcast(message);
    });

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });

});

/*  ****** Serveur web et WebSocket en ecoute sur le port 80  ********   */
//  
exp.listen(portServ, function () {
    console.log('Serveur en ecoute');
}); 

/*  ****************** Broadcast clients WebSocket  **************   */
var aWss = expressWs.getWss('/echo');

var WebSocket = require('ws');
aWss.broadcast = function broadcast(data) {
    console.log("Broadcast aux clients navigateur : %s", data);
    aWss.clients.forEach(function each(client) {
        if (client.readyState == WebSocket.OPEN) {
            client.send(data, function ack(error) {
                console.log("    -  %s-%s", client._socket.remoteAddress,
                    client._socket.remotePort);
                if (error) {
                    console.log('ERREUR websocket broadcast : %s', error.toString());
                }
            });
        }
    });
}; 

var question = '?';
var bonneReponse = 0;

// Connexion des clients a la WebSocket /qr et evenements associés 
// Questions/reponses 
exp.ws('/qr', function (ws, req) {
    console.log('Connection WebSocket %s sur le port %s',
        req.connection.remoteAddress, req.connection.remotePort);
    NouvelleQuestion();

    ws.on('message', TraiterReponse);

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    });

    if (message == bonneReponse) {
        // Bonne réponse uniquement au joueur concerné
        ws.send("Bonne réponse !");

        // Après 3 secondes on envoie une nouvelle question
        setTimeout(() => {
            NouvelleQuestion();
        }, 3000);
    } else {
        // Mauvaise réponse uniquement au joueur concerné
        ws.send("Mauvaise réponse !");

        // Après 3 secondes on réaffiche la même question
        setTimeout(() => {
            ws.send(question);
        }, 3000);
    }


    function TraiterReponse(message) {
        console.log('De %s %s, message :%s', req.connection.remoteAddress,
            req.connection.remotePort, message);
        if (message == bonneReponse) {
            NouvelleQuestion();
        }
    }


    function NouvelleQuestion() {
        var x = GetRandomInt(11);
        var y = GetRandomInt(11);
        question = x + '*' + y + ' =  ?';
        bonneReponse = x * y;
        aWss.broadcast(question);
    }

    function GetRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

}); 

 

    
