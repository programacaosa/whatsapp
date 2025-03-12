const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

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
    const qrCodePath = path.join(__dirname, 'qr-code.png');

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

// Rota para baixar o QR Code gerado
app.get('/download-qr', (req, res) => {
    const qrCodePath = path.join(__dirname, 'qr-code.png');

    // Verifica se o arquivo existe
    if (fs.existsSync(qrCodePath)) {
        res.download(qrCodePath, 'qr-code.png', (err) => {
            if (err) {
                res.status(500).send('Erro ao baixar o QR Code');
            }
        });
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
