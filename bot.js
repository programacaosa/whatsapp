const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
    authStrategy: new LocalAuth()
});

const responsesFilePath = path.join(__dirname, 'responses.txt');

// Função para carregar respostas
function loadResponses() {
    try {
        const fileContent = fs.readFileSync(responsesFilePath, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        const responses = {};
        lines.forEach(line => {
            const [keyword, response] = line.split('|').map(item => item.trim());
            if (keyword && response) {
                responses[keyword.toLowerCase()] = response;
            }
        });
        return responses;
    } catch (error) {
        console.error('Erro ao ler o arquivo responses.txt:', error);
        return {};
    }
}

let responses = loadResponses();

// Quando cliente estiver pronto
client.on('ready', () => {
    console.log('Cliente WhatsApp pronto!');
});

// Geração de QR Code
client.on('qr', (qr) => {
    const qrCodePath = path.join(__dirname, 'qr-code.png');
    qrcode.toFile(qrCodePath, qr, {
        color: {
            dark: '#000000',
            light: '#FFFFFF'
        }
    }, (err) => {
        if (err) {
            console.error('Erro ao gerar o QR Code:', err);
        } else {
            console.log('QR Code gerado e salvo como qr-code.png');
        }
    });
});

// Manipulação de mensagens
client.on('message', async (message) => {
    const text = message.body.toLowerCase();

    // ⚙️ Verifica o comando "foto" ou "imagem"
    if (text.includes('foto') || text.includes('imagem')) {
        const fotosDir = path.join(__dirname, 'fotos');

        // Verifica se a pasta de fotos existe
        if (fs.existsSync(fotosDir)) {
            const fotos = fs.readdirSync(fotosDir).filter(file => {
                return /\.(jpg|jpeg|png|gif)$/i.test(file); // Aceita apenas imagens
            });

            if (fotos.length > 0) {
                // Seleciona uma imagem aleatória
                const randomFoto = fotos[Math.floor(Math.random() * fotos.length)];
                const fotoPath = path.join(fotosDir, randomFoto);

                // Carrega e envia a imagem
                const media = await MessageMedia.fromFilePath(fotoPath);
                await message.reply(media);
                console.log(`Enviada imagem: ${randomFoto}`);
            } else {
                await message.reply('Nenhuma imagem encontrada na pasta de fotos.');
                console.log('Pasta de fotos está vazia.');
            }
        } else {
            await message.reply('Pasta de fotos não encontrada no servidor.');
            console.log('Pasta de fotos não encontrada.');
        }
        return; // Interrompe o restante do processamento para não responder duas vezes
    }

    // 🔑 Verifica palavras-chave do responses.txt
    for (const keyword in responses) {
        if (text.includes(keyword)) {
            const response = responses[keyword];
            await message.reply(response);
            console.log(`Respondido: ${response}`);
            return;
        }
    }

    console.log('Mensagem sem correspondência:', message.body);
});

// Rota para visualizar QR Code
app.get('/qr-code', (req, res) => {
    const qrCodePath = path.join(__dirname, 'qr-code.png');
    if (fs.existsSync(qrCodePath)) {
        res.sendFile(qrCodePath);
    } else {
        res.status(404).send('QR Code não encontrado');
    }
});

// Rota de saúde
app.get('/', (req, res) => {
    res.send('Bot WhatsApp funcionando!');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

// Inicializa o cliente
client.initialize();
