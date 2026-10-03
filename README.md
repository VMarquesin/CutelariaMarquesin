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

# Notas de Lançamento: Perfil de Usuário e Object Storage

**Data:** 02 de Outubro de 2026
**Módulo:** Autenticação & Catálogo (Transformação Social)

## Visão Geral
Nesta atualização, o sistema evolui de um simples catálogo para uma experiência mais social. Cada usuário agora possui uma página de Perfil personalizada com foto, biografia e o seu próprio mural de lâminas favoritadas.

A principal mudança arquitetural desta entrega é a introdução de um **Object Storage (MinIO)** dedicado exclusivamente para o armazenamento de arquivos binários (imagens), desafogando o banco de dados relacional.

---

## O que há de novo no Frontend?

* **Nova Rota Privada (`/perfil`):** Acesso direto pelo menu lateral ("Meu Perfil") da aplicação principal.
* **Interface do Perfil (`Perfil.jsx`):** 
    * Exibe a foto do usuário, `username` e `bio`.
    * Na ausência de foto, um *placeholder* dinâmico com a inicial do usuário é gerado na interface.
* **Mecanismo de Upload Dinâmico:** 
    * Suporte a envio de imagens via objeto `FormData`.
    * Validação em tempo real no cliente: aceita apenas formato imagem com limite de 5MB.
    * Atualização de estado (UI) instantânea: a foto muda na tela imediatamente após o sucesso do upload, sem necessidade de recarregar a página.
* **Feedback Visual (Toast):** Alertas flutuantes no canto superior direito informando o sucesso ou erro no upload, desaparecendo automaticamente após 4 segundos.
* **Galeria de Favoritos Integrada:** O perfil agora reaproveita a rota `GET /referencias` para construir um grid elegante com *overlay* de interações, mostrando tudo o que o usuário favoritou na plataforma.

---

## Backend & Infra

O fluxo de upload foi construído separando as responsabilidades de armazenamento:

1. **Recepção em Memória (`multer`):** O backend (Node.js) recebe o arquivo via `POST /auth/perfil/foto`, validando o *mimetype* (apenas imagens) e limitando o *buffer* a 5MB na memória RAM.
2. **Envio para Object Storage (`minio`):** O SDK do MinIO faz o *streaming* da imagem da memória direto para um *bucket* dedicado chamado `perfil-fotos`.
3. **Gravação Leve no MariaDB:** O banco de dados relacional (MariaDB) nunca toca no arquivo binário. Ele apenas recebe um `UPDATE` salvando a referência textual da imagem (a URL pública) na nova coluna `foto_perfil`.
4. **Segurança de Identidade (Enforcement):** Para cumprir os requisitos de segurança, o sistema bloqueia tentativas de edição de terceiros. A rota confia **apenas** no ID extraído do Token JWT do cabeçalho da requisição, ignorando qualquer ID que venha no corpo do envio.

## Decisões Arquiteturais
* **Bucket de Leitura Pública:** Optou-se por configurar o bucket do MinIO com permissão de *download anônimo*. Como fotos de perfil são dados públicos por natureza em redes sociais, isso permite o carregamento direto pelo navegador do usuário e cache otimizado, sem a necessidade de o backend gerar URLs pré-assinadas (*Pre-Signed URLs*) a cada acesso.