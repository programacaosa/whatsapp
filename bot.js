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

// Função para carregar as respostas do arquivo
function loadResponses() {
    // Caminho para o arquivo 'responses.txt' que está no repositório Git
    const responsesPath = path.join(__dirname, 'responses.txt');
    
    // Verifica se o arquivo existe
    if (!fs.existsSync(responsesPath)) {
        console.error("O arquivo 'responses.txt' não foi encontrado.");
        return {};
    }
    
    const responses = fs.readFileSync(responsesPath, 'utf-8').split('\n');
    const responseMap = {};

    // Cria um mapa de respostas
    responses.forEach(response => {
        const [keyword, reply] = response.split('|');
        if (keyword && reply) {
            responseMap[keyword.trim().toLowerCase()] = reply.trim();
        }
    });

    return responseMap;
}

// Carregar as respostas do arquivo
const responses = loadResponses();

// Quando uma nova mensagem chega
client.on('message', async (message) => {
    const chat = await message.getChat();
    const contactNumber = chat.id.user; // Número do contato

    // Formatar a mensagem para salvar no arquivo
    const messageText = `${new Date().toLocaleString()}: ${message.body}\n`;

    // Salvar a mensagem no arquivo correspondente
    const filePath = path.join(__dirname, `${contactNumber}.txt`);
    fs.appendFileSync(filePath, messageText);
    console.log(`Conversa salva em: ${filePath}`);

    // Buscar por uma correspondência no arquivo de respostas
    const response = responses[message.body.toLowerCase()] || "Desculpe, não entendi.";

    // Enviar a resposta
    await message.reply(response);
});

// Rota para acessar o QR Code gerado
app.get('/qr-code', (req, res) => {
    const qrCodePath = path.join(__dirname, 'qr-code.png');

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
