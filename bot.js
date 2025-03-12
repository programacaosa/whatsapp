const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const express = require('express');
const app = express();
const port = 3000;  // Você pode alterar a porta se necessário

// Cria uma nova instância do cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Cria uma rota para a página inicial
app.get('/', (req, res) => {
    // Exibe a página inicial com a instrução para escanear o QR Code
    res.send('<h1>Por favor, escaneie o QR Code abaixo para conectar o WhatsApp:</h1><img src="/qr.png" alt="QR Code">');
});

// Cria uma rota para servir o arquivo do QR Code
app.get('/qr.png', (req, res) => {
    const qrImagePath = path.join(__dirname, 'qr.png');
    res.sendFile(qrImagePath);  // Serve o arquivo de imagem gerado do QR Code
});

// Gera e salva o QR Code como uma imagem
client.on('qr', (qr) => {
    const qrImagePath = path.join(__dirname, 'qr.png');
    qrcode.toFile(qrImagePath, qr, (err) => {
        if (err) {
            console.error('Erro ao gerar QR Code:', err);
        } else {
            console.log('QR Code gerado em qr.png');
        }
    });
});

// Quando o cliente estiver pronto, exibe uma mensagem no console
client.on('ready', () => {
    console.log('Cliente WhatsApp pronto!');
});

// Responde a mensagens recebidas e salva as conversas em um arquivo .txt
client.on('message', async (message) => {
    const chat = await message.getChat();
    const contactNumber = chat.id.user; // Número do contato

    // Cria ou abre um arquivo para a conversa
    const filePath = path.join(__dirname, `${contactNumber}.txt`);

    // Formata a mensagem para salvar
    const messageText = `${new Date().toLocaleString()}: ${message.body}\n`;

    // Salva a mensagem no arquivo correspondente
    fs.appendFileSync(filePath, messageText);
    console.log(`Conversa salva em: ${filePath}`);

    // Respostas automáticas
    if (message.body.toLowerCase() === 'oi') {
        await message.reply('Olá! Como posso ajudar você hoje?');
    } else if (message.body.toLowerCase() === 'ajuda') {
        await message.reply('Claro! O que você precisa?');
    }
});

// Rota de saúde (verifica se o servidor está funcionando)
app.get('/status', (req, res) => {
    res.send('Bot WhatsApp funcionando!');
});

// Inicia o servidor Express na porta definida
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Inicia o cliente do WhatsApp
client.initialize();
