import streamlit as st
import os
import streamlit.components.v1 as components

# Configurações da página
st.set_page_config(page_title="CRM WhatsApp: Arraste as conversas para a coluna desejada", layout="wide")

# Título da aplicação
st.markdown("<h2 style='font-size: 24px;'>CRM WhatsApp: Arraste as conversas para a coluna desejada</h2>", unsafe_allow_html=True)

# Caminho da pasta onde as conversas estão armazenadas
folder_path = 'conversas'

# Função para ler os arquivos de conversa
def read_conversations(folder_path):
    conversations = []
    for filename in os.listdir(folder_path):
        if filename.endswith('.txt'):
            with open(os.path.join(folder_path, filename), 'r', encoding='utf-8') as file:
                content = file.read()
                conversations.append({'name': filename.replace('.txt', ''), 'content': content})
    return conversations

# Lê as conversas da pasta
conversations = read_conversations(folder_path)

# Função para gerar HTML dos cartões de conversa com a opção "Ver mais"
def generate_conversation_cards_html(conversations):
    html_cards = ""
    for i, conv in enumerate(conversations):
        card_html = f"""
        <div class="card" draggable="true" id="conv-{i}">
            <h4>{conv['name']}</h4>
            <p id="short-{i}" class="card-content">{conv['content'][:100]}... <button onclick="showFullConversation({i})">Ver mais</button></p>
            <p id="full-{i}" style="display:none;" class="card-content">{conv['content']} <button onclick="hideFullConversation({i})">Ver menos</button></p>
        </div>
        """
        html_cards += card_html
    return html_cards

# Gerar HTML dinâmico dos cards
cards_html = generate_conversation_cards_html(conversations)

# Criando o HTML com Drag and Drop e a funcionalidade de "Ver mais" / "Ver menos"
html_code = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drag and Drop</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.14.0/Sortable.min.js"></script>
    <style>
        body {{
            font-family: Arial, sans-serif;
            background-color: #f0f0f5;
            margin: 0;
            padding: 20px;
        }}
        .container {{
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }}
        .column {{
            width: 23%;
            min-height: 300px;
            padding: 10px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }}
        .column h3 {{
            text-align: center;
            color: #333;
        }}
        .card {{
            background-color: #fafafa;
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
            box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }}
        .card:hover {{
            transform: scale(1.02);
        }}
        .card-content {{
            color: #6a0dad; /* Cor roxa para o texto */
        }}
        button {{
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            transition: background-color 0.3s;
        }}
        button:hover {{
            background-color: #0056b3;
        }}
    </style>
</head>
<body>

<div class="container">
    <div class="column" id="leads">
        <h3>Leads</h3>
        {cards_html} <!-- Inserir os cartões de conversas aqui -->
    </div>
    <div class="column" id="em-aberto">
        <h3>Em aberto</h3>
    </div>
    <div class="column" id="em-andamento">
        <h3>Em andamento</h3>
    </div>
    <div class="column" id="contrato-fechado">
        <h3>Contrato fechado</h3>
    </div>
</div>

<script>
    const columns = document.querySelectorAll('.column');

    columns.forEach(column => {{
        new Sortable(column, {{
            group: 'shared',
            animation: 150
        }});
    }});

    function showFullConversation(index) {{
        document.getElementById('short-' + index).style.display = 'none';
        document.getElementById('full-' + index).style.display = 'block';
    }}

    function hideFullConversation(index) {{
        document.getElementById('short-' + index).style.display = 'block';
        document.getElementById('full-' + index).style.display = 'none';
    }}
</script>

</body>
</html>
"""

# Inserindo o HTML na aplicação Streamlit
components.html(html_code, height=600)

# Rodapé
st.markdown("<hr>", unsafe_allow_html=True)
st.write("Desenvolvido com ❤️ por [Seu Nome]")  # Personalize seu nome aqui
