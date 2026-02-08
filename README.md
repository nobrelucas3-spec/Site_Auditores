# Associação Auditores TCE-PE - Website

Este é o repositório do site da Associação dos Auditores de Controle Externo do TCE-PE.

## Como Rodar o Projeto

Para visualizar o site no seu computador, siga os passos abaixo:

### 1. Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.

### 2. Instalação (apenas na primeira vez)
No terminal, dentro da pasta do projeto, execute:
```bash
npm install
```

### 3. Rodar o Site (Modo Desenvolvimento)
Para abrir o site e ver as alterações em tempo real:
```bash
npm run dev
```
O site estará disponível em: `http://localhost:5173`

### 4. Apresentar em Celulares/Tablets (Mesma Rede Wi-Fi)
Para mostrar o site em outros dispositivos na mesma rede:
```bash
npm run dev -- --host
```
O terminal mostrará um endereço de "Network" (ex: `http://192.168.1.15:5173`). Digite esse endereço no navegador do celular.

## Estrutura do Projeto
- `/src`: Código fonte do site (React components, pages, styles)
- `/public`: Imagens e arquivos estáticos
- `/dist`: Arquivos de produção gerados pelo build
