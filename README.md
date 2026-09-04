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

Controle de Acesso (RBAC)

usuario: Pode visualizar o catálogo de cutelaria, fazer login e gerenciar seu próprio perfil.

admin: Tem todas as permissões do usuario e, adicionalmente, possui acesso ao painel de controle para listar todos os usuários cadastrados e promover/rebaixar papéis (moderação de contas).

Decisão Arquitetural (Padrão A vs. B)
O nosso sistema utiliza o Padrão B (Claims no token JWT). No momento do login, o auth-service injeta a claim role dentro do token assinado.

Por que não o Padrão A? Se usássemos o Padrão A, o microsserviço do Catálogo precisaria fazer uma requisição HTTP para o auth-service a cada tentativa de exclusão ou edição, criando um gargalo de rede.

O que mudaria no código para o Padrão A? Precisaríamos remover a validação de token do Catálogo, criar uma rota POST /auth/validate no serviço de autenticação, e forçar o Catálogo a perguntar ao auth-service se a ação é permitida em toda requisição sensível.