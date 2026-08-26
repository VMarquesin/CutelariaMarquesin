# Catálogo de Cutelaria - Arquitetura de Microsserviços

Olá professor [@siriani](https://github.com/siriani),
Esta é a entrega referente à evolução da arquitetura (Desacoplando o Login).

### O que mudou (Atividade 3):
O sistema, que antes operava como um monólito, foi reestruturado. Toda a responsabilidade de gestão de usuários (Login, Cadastro, Papéis de Usuário e Recuperação de Senha) foi extraída e isolada em um novo microsserviço chamado `AuthService`.

### Destaques da Implementação:
- **Separação de Responsabilidades:** O `Catálogo` atua como proxy para rotas de autenticação, comunicando-se com o `AuthService` exclusivamente pela rede interna do Docker (via chamadas HTTP).
- **Segurança (Invisível para a Internet):** O `docker-compose.yml` evidencia que o container do `AuthService` **não possui portas publicadas** (`ports`) para o host. Ele é inacessível pelo meio externo.
- **Recuperação de Senha Real:** Fluxo completo com geração de tokens seguros (UUID), expiração rígida de 30 minutos, invalidação após o uso e envio de e-mails reais integrados ao SMTP do Mailtrap.
- **Roles:** Adição da coluna `role` no banco de dados para controle de papéis (ex: `usuario`, `admin`).