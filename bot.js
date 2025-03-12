const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');

// Cria uma nova instância do cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Configuração do servidor Express
const app = express();
const port = process.env.PORT || 3000;  // Usando a porta dinâmica fornecida pelo Render

// Quando o cliente estiver pronto, exibe uma mensagem no console
client.on('ready', () => {
    console.log('Cliente WhatsApp pronto!');
});

// Gera e exibe um QR code no terminal para autenticação
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
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
app.get('/', (req, res) => {
    res.send('Bot WhatsApp funcionando!');
});

// Inicia o servidor Express na porta definida
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Inicia o cliente do WhatsApp
client.initialize();
