# LogisOS 📦

**LogisOS** é um sistema moderno e inteligente de gestão logística, projetado com uma arquitetura de microsserviços para orquestrar pedidos, rastreamento e clientes de ponta a ponta.

## 🚀 Arquitetura e Tecnologias

A aplicação é dividida em serviços isolados, rodando sobre contêineres Docker, o que permite alta escalabilidade e manutenção independente:

- **Frontend (Web)**: Desenvolvido em **React + TypeScript + Vite**. Fornece um painel (Dashboard) interativo, moderno e em tempo real.
- **Order Service**: Microsserviço responsável por gerenciar Pedidos, Clientes (Customer DB) e Integrações (Auditoria/SMS). Feito com **Node.js, Express e TypeScript**.
- **Tracking Service**: Microsserviço isolado focado apenas no estado do pacote no mundo físico, lidando com transições de status (Preparando, Em Trânsito, Entregue, Cancelado). Feito com **Node.js, Express e TypeScript**.
- **Database**: Banco de dados relacional **PostgreSQL**, onde as entidades (Pedidos, Rastreios, Clientes e Auditoria) estão modeladas de forma estruturada.

## 🌟 Funcionalidades Implementadas

1. **Gestão e Cadastro de Clientes (CRUD)**
   - Cadastro estruturado de clientes.
   - Geração automática de `ID do Cliente`.
   - Auto-preenchimento (Dropdown Inteligente) na criação de novos pedidos: ao escolher um cliente, endereço, telefone e e-mail são preenchidos automaticamente.
   
2. **Criação de Pedidos Dinâmica**
   - Inserção de métricas de frete com cálculo de taxas ao vivo (Standard vs Express) baseados na distância e peso.
   
3. **Tracking & Rastreamento em Tempo Real**
   - O pacote pode ter seu status atualizado a cada instante.
   - Botão de cancelamento rápido ("Kill Switch") que paralisa a entrega imediatamente.

4. **Auditoria Avançada (Singleton Observer)**
   - O sistema implementa o design pattern *Observer* juntamente com um *Singleton* para escutar todos os eventos vitais da plataforma.
   - **Integração com SMS Gateway (Mock)**: Quando um pedido é cancelado, um gatilho de notificação via SMS é simulado e imediatamente registrado na trilha de auditoria.

5. **Dashboard Financeiro**
   - Cálculo rigoroso e unificado de Receita Total e Ticket Médio, derivado de uma fórmula matemática em backend e replicada dinamicamente no frontend.

## ⚙️ Como Executar o Projeto

O projeto inteiro foi construído para rodar localmente com extrema facilidade, graças à conteinerização.

### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Compose instalados.

### Passos

1. Clone o repositório na sua máquina.
2. Acesse a raiz do projeto:
   ```bash
   cd logios
   ```
3. Suba todos os contêineres:
   ```bash
   docker compose up -d --build
   ```
4. Pronto! O acesso à aplicação estará disponível em:
   - **Frontend:** http://localhost:80 (ou apenas `localhost`)
   - **Order Service (API):** http://localhost:3001
   - **Tracking Service (API):** http://localhost:3002

## 🔒 Variáveis de Ambiente e Configuração
As configurações de conexão entre serviços estão embutidas no arquivo `docker-compose.yml`. Em ambiente de produção, certifique-se de alterar as credenciais de banco de dados (`POSTGRES_USER` e `POSTGRES_PASSWORD`).
