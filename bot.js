const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

// Cria um diretório público para armazenar o QR code, caso não exista
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Cria uma nova instância do cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Quando o cliente estiver pronto, exibe uma mensagem no console
client.on('ready', () => {
    console.log('Cliente WhatsApp pronto!');
});

// Gera e salva o QR Code como imagem para autenticação
client.on('qr', (qr) => {
    const qrCodePath = path.join(publicDir, 'qr-code.png');

    // Gera a imagem do QR Code e salva no arquivo
    qrcode.toFile(qrCodePath, qr, {
        color: {
            dark: '#000000',  // Cor do QR Code
            light: '#FFFFFF'  // Cor do fundo
        }
    }, (err) => {
        if (err) {
            console.error('Erro ao gerar o QR Code:', err);
        } else {
            console.log('QR Code gerado e salvo como qr-code.png');
        }
    });
});

// Rota para acessar o QR Code gerado
app.get('/qr-code', (req, res) => {
    const qrCodePath = path.join(publicDir, 'qr-code.png');

    // Verifica se o QR Code foi gerado
    if (fs.existsSync(qrCodePath)) {
        res.sendFile(qrCodePath);  // Serve o arquivo como resposta
    } else {
        res.status(404).send('QR Code não encontrado');
    }
});

// Rota de saúde (verifica se o servidor está funcionando)
app.get('/', (req, res) => {
    res.send('Bot WhatsApp funcionando!');
});

// Inicia o servidor Express na porta definida
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Inicia o cliente do WhatsApp
client.initialize();
