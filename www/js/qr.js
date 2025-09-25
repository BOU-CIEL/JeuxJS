console.log('Hello World!');

var ipServeur = '172.17.50.127';     // Adresse ip du serveur  
var ws;                             // Variable pour l'instance de la WebSocket.

window.onload = function () {
    if (TesterLaCompatibilite()) {
        ConnexionAuServeurWebsocket();
    }
    ControleIHM();
};

function TesterLaCompatibilite() {
    let estCompatible = true;
    if (!('WebSocket' in window)) {
        window.alert('WebSocket non supporté par le navigateur');
        estCompatible = false;
    }
    return estCompatible;
}

/*  ***************** Connexion au serveur WebSocket ********************   */
// 
function ConnexionAuServeurWebsocket() {
    ws = new WebSocket('ws://' + ipServeur + '/qr');

    ws.onclose = function (evt) {
        window.alert('WebSocket close');
    };

    ws.onopen = function () {
        console.log('WebSocket open');
    };

    ws.onmessage = function (evt) {
        document.getElementById('messageRecu').value = evt.data;
    };
}

function ControleIHM() {
    document.getElementById('Envoyer').onclick = BPEnvoyer;
}

function BPEnvoyer() {
    ws.send(document.getElementById('messageEnvoi').value);
}

/*  *************** serveur WebSocket express /qr *********************   */
// 
exp.ws('/qr', function (ws, req) {
    console.log('Connection WebSocket %s sur le port %s', req.connection.remoteAddress,
        req.connection.remotePort);
    jeuxQr.NouvelleQuestion();

    ws.on('message', TMessage);
    function TMessage(message) {
        jeuxQr.TraiterReponse(ws, message);
    }

    ws.on('close', function (reasonCode, description) {
        console.log('Deconnexion WebSocket %s sur le port %s',
            req.connection.remoteAddress, req.connection.remotePort);
    }); 

    ws.on('close', function (reasonCode, description) {
        //console.log('Deconnexion WebSocket %s sur le port %s', 
        req.connection.remoteAddress, req.connection.remotePort);
    jeuxQr.Deconnecter(ws);
}); 

