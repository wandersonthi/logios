# Logios - Logistics and Delivery Management System

Bem-vindo ao repositório do **Logios**, uma solução de software projetada para gerenciar pedidos de entrega e rastreamento em tempo real. Este projeto foi desenvolvido para demonstrar proficiência avançada em engenharia de software e arquitetura de sistemas.

## 📖 Descrição do Problema
O gerenciamento de entregas de última milha é um desafio para empresas de e-commerce. A falta de visibilidade em tempo real, cálculos de frete rígidos e sistemas monolíticos difíceis de escalar são problemas comuns. 

**Solução:** O Logios divide essa complexidade em dois microsserviços autônomos que cuidam da criação de pedidos, cálculo de frete e rastreamento de entregas.

## 🏗️ Arquitetura e Microsserviços
A solução é composta por:
1. **Order Service (Porta 3001):** Responsável por receber solicitações de entrega, calcular o valor do frete com base em peso e distância e persistir o pedido.
2. **Tracking Service (Porta 3002):** Responsável por atualizar o status da entrega e notificar interessados em tempo real.

Ambos os microsserviços utilizam **Arquitetura Limpa (Clean Architecture)**:
- `domain/`: Entidades puras, regras de negócio centrais, padrões de projeto independentes de frameworks.
- `application/`: Casos de uso (Use Cases) e interfaces de repositórios (DIP).
- `infrastructure/`: Implementação concreta de acesso a banco de dados (PostgreSQL).
- `presentation/`: Controladores Express que expõem as APIs REST.

## 🛡️ SOLID Aplicado
- **SRP:** `CreateOrderUseCase` faz apenas a criação do pedido, delegando persistência ao repositório e cálculo de frete às estratégias.
- **OCP:** Novas estratégias de frete podem ser adicionadas implementando `ShippingStrategy` sem alterar as classes de cálculo atuais.
- **LSP / DIP:** Os casos de uso dependem apenas de abstrações (`IOrderRepository`, `ITrackingRepository`), permitindo substituir o banco de dados sem alterar a lógica de negócios.
- **ISP:** Interfaces limpas apenas com os métodos necessários (`save`, `findByOrderId`).

## 🧩 Design Patterns Aplicados (4+)
1. **Strategy:** Utilizado no cálculo de frete (`StandardShippingStrategy` e `ExpressShippingStrategy`).
2. **Factory Method:** `ShippingStrategyFactory` decide qual estratégia de frete instanciar com base na entrada do usuário.
3. **Repository:** Abstração de persistência (`PostgresOrderRepository` e `PostgresTrackingRepository`).
4. **Observer:** `TrackingSubject` notifica observadores (ex: `EmailNotificationObserver`) sempre que um status de rastreamento é atualizado.

## 🧹 Clean Code
- Nomes de variáveis descritivos.
- Injeção de dependência para evitar alto acoplamento.
- Separação clara de responsabilidades (Controllers tratam req/res, Use Cases tratam lógica, Repositories tratam dados).
- Tratamento de exceções centralizado.

## 🧪 Testes (TDD e BDD)
- **TDD:** O desenvolvimento foi guiado por testes unitários criados com `Jest` para as estratégias de frete e lógica de rastreamento.
- **BDD:** Cenários Gherkin escritos no `cucumber.js` para garantir o comportamento sob a ótica de negócios.
  - Ex: *Feature: Create Order and Calculate Shipping* -> *Given an order... When standard shipping... Then cost is 80*.

## 🐳 Execução e Docker
O projeto é completamente dockerizado para desenvolvimento e produção.
1. Clone o repositório.
2. Execute `docker-compose up -d --build`.
3. Os serviços estarão disponíveis nas portas 3001 e 3002. O PostgreSQL roda internamente na 5432.

## 🚀 Deploy e Justificativas Técnicas
O sistema foi projetado para rodar em uma **VPS Ubuntu**.
O `docker-compose` permite que todos os serviços subam orquestrados sem a necessidade de configurar ambientes Node.js ou Bancos de dados manualmente na máquina host, garantindo imutabilidade e paridade entre os ambientes.

As tecnologias Node.js + TypeScript foram escolhidas devido ao seu ecossistema robusto para microsserviços, suporte nativo avançado a tipagem estática (facilitando SOLID) e curva de performance aceitável para I/O intensivo como APIs RESTful de rastreamento e pedidos.
