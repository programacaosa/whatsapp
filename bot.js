const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

// Cria uma nova instância do cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()  // Usando a estratégia de autenticação local sem Chromium
});

// Caminho para o arquivo responses.txt
const responsesFilePath = path.join(__dirname, 'responses.txt');

// Função para carregar as respostas do arquivo responses.txt
function loadResponses() {
    try {
        const fileContent = fs.readFileSync(responsesFilePath, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        const responses = {};

        // Processa cada linha do arquivo
        lines.forEach(line => {
            const [keyword, response] = line.split('|').map(item => item.trim());
            if (keyword && response) {
                responses[keyword.toLowerCase()] = response; // Armazena em letras minúsculas
            }
        });

        return responses;
    } catch (error) {
        console.error('Erro ao ler o arquivo responses.txt:', error);
        return {};
    }
}

// Carrega as respostas do arquivo
let responses = loadResponses();

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

// Manipula mensagens recebidas
client.on('message', async (message) => {
    const text = message.body.toLowerCase(); // Converte a mensagem para minúsculas

    // Verifica se há uma palavra-chave correspondente
    for (const keyword in responses) {
        if (text.includes(keyword)) {
            const response = responses[keyword];
            await message.reply(response); // Responde automaticamente
            console.log(`Respondido: ${response}`);
            return;
        }
    }

    // Caso não encontre nenhuma palavra-chave
    console.log('Mensagem sem correspondência:', message.body);
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
