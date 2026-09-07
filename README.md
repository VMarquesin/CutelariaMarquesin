# Catálogo de Cutelaria - Arquitetura de Microsserviços

@siriani,

Esta é a entrega referente à evolução da arquitetura, contemplando Auditoria, Observabilidade e Enforcement de Segurança (RBAC).

## O que mudou na Atualização Mais Recente:

O sistema, que já possuía o login desacoplado, evoluiu para incluir um robusto rastreamento de ações e auditoria. Foi criado um terceiro microsserviço, o log-service, que atua de forma assíncrona recebendo eventos críticos de negócio e segurança. Além disso, as rotas administrativas agora possuem bloqueio real (Enforcement) no servidor.

## Destaques da Nova Implementação (Logs e Auditoria):

### Arquitetura Produtor/Consumidor:

Os serviços AuthService e Catálogo atuam como "Produtores" de eventos, enquanto o banco Redis e o log-service atuam como fila e armazenamento (Consumidor).

### Fila de Mensagens com Redis Streams:

Utilização do Redis (XADD) para salvar os logs de forma cronológica, veloz e persistente, substituindo logs de terminal efêmeros por verdadeiras trilhas de auditoria.

### Persistência em Nuvem (Docker Volumes):

Implementação de volume dedicado (redis-data) no docker-compose.yml para garantir que o histórico de auditoria sobreviva a atualizações (redeploys) dos containers no Portainer.

### Captura Avançada de Contexto e IP:

Os logs registram o usuario_id, a acao, capturam o IP real de origem (via proxy x-forwarded-for), além de injetar data/hora automática e detalhes descritivos da ação.

### Auditoria de Negócio e Segurança:

Rastreamento abrangente cobrindo: LOGIN_SUCESSO, LOGOUT, tentativas de invasão (TENTATIVA_ACESSO_ADMIN_NEGADO - 403), e ações de negócio como FAVORITAR_REFERENCIA (salvando ID da lâmina e comentários).

### Painel Front-end Integrado:

O painel de administração da Forja consome o endpoint /logs e exibe os registros em uma tabela formatada, exclusiva para Administradores.

## Controle de Acesso (RBAC) e Enforcement

usuario: Pode visualizar o catálogo de cutelaria, fazer login, favoritar referências e gerenciar seu perfil.

admin: Tem todas as permissões do usuário e acesso exclusivo ao painel de controle para listar usuários, alterar papéis e auditar os logs do sistema.

### Enforcement Ativo:

Foi implementado um middleware (verificarAdmin) que bloqueia ativamente qualquer usuário sem a role 'admin' de acessar o painel, retornando HTTP 403 (Forbidden) e disparando um alerta para o microsserviço de logs.

## Decisão Arquitetural (Padrão A vs. B)

O nosso sistema utiliza o Padrão B (Claims no token JWT). No momento do login, o auth-service injeta a claim role dentro do token assinado.

### Por que não o Padrão A?

Se usássemos o Padrão A, o microsserviço do Catálogo precisaria fazer uma requisição HTTP para o auth-service a cada tentativa de exclusão, edição ou visualização de área restrita, criando um gargalo de rede.

### O que mudaria no código para o Padrão A?

Precisaríamos remover a validação de token descentralizada do Catálogo, criar uma rota POST /auth/validate no serviço de autenticação, e forçar o Catálogo a perguntar ao auth-service se a ação é permitida em toda requisição sensível.

## Histórico da Arquitetura (Desacoplamento)

### Separação de Responsabilidades:

Toda a gestão de usuários fica isolada no AuthService. O Catálogo-API atua como proxy para as rotas de autenticação e logs.

### Segurança da Rede Interna:

O AuthService, o log-service e os bancos de dados não possuem portas publicadas para a internet. Eles são acessíveis apenas internamente pela rede do Docker.

### Recuperação de Senha Real:

Fluxo completo com geração de tokens seguros (UUID), expiração de 30 minutos e envio de e-mails reais via SMTP.