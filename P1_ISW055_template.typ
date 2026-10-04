// ============================================================
//  P1 — Relatório bimestral de atividades (entrega INDIVIDUAL)
//  ISW055 · Introdução à Computação em Nuvem · Fatec Pompeia · 2026.2
//
//  Compilação (na pasta onde estão este arquivo e a pasta prints/):
//    typst compile P1_ISW055_template.typ P1_ISW055_Vinicius_Marquesin.pdf
//
//  Entrega: 07/10/2026 · PDF nomeado P1_ISW055_Nome_Sobrenome.pdf
// ============================================================

// ---------- DADOS DO ALUNO ----------
#let aluno = "Vinicius Rodrigues Marquesin"
#let turma = "Sistemas Inteligentes"
#let data-relatorio = "03/10/2026"

// ---------- configuração do documento ----------
#let disciplina = "Introdução à Computação em Nuvem"
#let codigo = "ISW055"
#let professor = "Prof. Allan Lincoln Rodrigues Siriani"
#let accent = rgb("#b96f1f")
#let repo = "https://github.com/VMarquesin/CutelariaMarquesin"

#set document(title: "P1 — " + codigo + " — " + aluno, author: aluno)
#set page(paper: "a4", margin: (top: 2.5cm, bottom: 2.5cm, left: 2.5cm, right: 2cm))
#set text(size: 11pt, lang: "pt", region: "BR")
#set par(justify: true, leading: 0.7em)
#set heading(numbering: "1.1")
#show heading.where(level: 1): it => { v(0.6em); text(size: 16pt, it); v(0.2em) }
#show heading.where(level: 2): it => { v(0.5em); text(size: 13pt, it); v(0.1em) }
#show link: set text(fill: accent)
#show figure.caption: set text(size: 9pt, fill: luma(90))
#set table(stroke: 0.5pt + luma(200), inset: 6pt)
#show table: set text(hyphenate: false)
#show table: set par(justify: false)

// ---------- ajudantes ----------
#let evidencia(legenda, arquivo: none) = figure(
  if arquivo == none {
    rect(width: 100%, height: 5.5cm, radius: 4pt, stroke: (paint: luma(170), dash: "dashed"))[
      #align(center + horizon)[
        #text(fill: luma(130), size: 9.5pt)[print ausente]
      ]
    ]
  } else {
    image(arquivo, width: 100%)
  },
  kind: image,
  supplement: [Figura],
  caption: legenda,
)

#let registro = state("registro", ())

#let atividade(
  numero, titulo,
  descricao: "",
  planejada: "",
  realizada: "—",
  situacao: "entregue",   // entregue · entregue com atraso · não entregue
  evidencia: "",
  url: "",
  corpo,
) = {
  registro.update(l => l + ((
    numero: numero, titulo: titulo, descricao: descricao,
    planejada: planejada, realizada: realizada, situacao: situacao,
  ),))
  heading(level: 2, [Atividade #numero — #titulo])
  table(
    columns: (3.4cm, 1fr),
    fill: (x, y) => if x == 0 { luma(245) } else { none },
    [*Descrição*], [#descricao],
    [*Data planejada*], [#planejada],
    [*Data realizada*], [#realizada],
    [*Situação*], [#situacao],
    [*Evidência*], [#evidencia],
    [*Link*], [#if url == "" [—] else [#link(url)]],
  )
  corpo
}

// ============================================================
//  CAPA
// ============================================================
#align(center)[
  #v(2.5cm)
  #text(size: 12pt, tracking: 0.12em)[FATEC POMPEIA]
  #v(0.4em)
  #text(size: 10.5pt, fill: luma(110))[#disciplina · #codigo · #turma]
  #v(4.5cm)
  #text(size: 26pt, weight: "bold")[P1]
  #v(0.3em)
  #text(size: 18pt, weight: "bold")[Relatório bimestral de atividades]
  #v(0.8em)
  #text(size: 11pt, fill: luma(110))[Avaliação individual · 2026.2]
  #v(5cm)
  #text(size: 14pt)[#aluno]
  #v(1fr)
  #text(size: 10.5pt)[#professor \ Pompeia, #data-relatorio]
]

#set page(
  numbering: "1",
  number-align: right,
  header: context {
    set text(size: 8pt, fill: luma(120))
    [#codigo · P1 — Relatório bimestral #h(1fr) #aluno]
    line(length: 100%, stroke: 0.4pt + luma(200))
  },
)
#counter(page).update(1)

#outline(title: "Sumário", indent: 1.2em, depth: 2)
#pagebreak()

// ============================================================
= Introdução
// ============================================================
O presente relatório documenta a evolução técnica e arquitetural do projeto "Cutelaria Marquesin", desenvolvido ao longo do primeiro bimestre da disciplina. O sistema funciona como um catálogo interativo e seguro onde funcionarios da cutelaria marquesin e clientes da cutelaria podem favoritar, gerenciar e salvar referências visuais de lâminas e facas.

O objetivo do bimestre foi expandir esse escopo simples para simular os desafios de um software de nível de produção. Através das entregas, o sistema deixou de ser um sistema básico para se tornar uma aplicação distribuída, com escalabilidade, segurança e separação de responsabilidades.

Ao longo das semanas, a arquitetura foi transformada com a adoção do padrão de microsserviços. A infraestrutura base foi conteinerizada utilizando Docker, permitindo a orquestração de múltiplos serviços isolados. O ecossistema atual conta com um frontend reativo em React, um API Gateway (Catálogo API), um microsserviço dedicado de autenticação em Node.js (AuthService), um serviço de mensagens para logs assíncronos via Redis Streams, e um serviço de Object Storage (MinIO) para arquivos binários. Este documento detalha cada etapa dessa construção, comprovando a autoria e a consolidação dos conceitos aplicados.

// ============================================================
= Metodologia
// ============================================================
O desenvolvimento do sistema foi pautado em práticas modernas de Engenharia de Software. O ambiente de desenvolvimento local foi utilizando o VS Code e a infraestrutura foi inteiramente orquestrada via `docker-compose`, garantindo a paridade entre o ambiente de desenvolvimento e produção. O versionamento do código foi realizado através do Git, com repositório remoto hospedado no GitHub. Para a implantação (deploy), utilizou-se o servidor de produção da disciplina (`lapps.studio`), gerenciado através do Portainer, o que permitiu rotinas de CI/CD (Continuous Integration/Continuous Deployment) baseadas em webhooks e atualizações de imagem (Pull and Redeploy).

A comprovação das atividades descritas neste relatório baseia-se no princípio da rastreabilidade. As datas e horas informadas na seção de entregas (Data Realizada) foram extraídas diretamente dos _timestamps_ dos _commits_ no histórico do GitHub, obtidos com o comando `git log` (`git log --date=format:"%d/%m/%Y %H:%M" --format="%h %ad"`) e conferidos na página de cada commit no GitHub, garantindo a não alteração dos registros. As evidências visuais (capturas de tela) foram extraídas do ambiente de produção, demonstrando a integração dos microsserviços, a persistência de dados no MariaDB e no MinIO, e o roteamento de rede interna estabelecido no Docker.

// ============================================================
= Quadro de entregas
// ============================================================
#context {
  let l = registro.final()
  table(
    columns: (auto, 1.4fr, 2fr, 2.6cm, 2.9cm, 2.3cm),
    align: (center, left, left, center, center, center),
    fill: (x, y) => if y == 0 { luma(235) } else { none },
    table.header([*Nº*], [*Atividade*], [*Descrição*], [*Data \ planejada*], [*Data \ realizada*], [*Situação*]),
    ..l.map(a => (
      [#a.numero], [#a.titulo], [#text(size: 9pt)[#a.descricao]],
      [#a.planejada], [#a.realizada], [#a.situacao],
    )).flatten()
  )
}

// ============================================================
= Atividades realizadas
// ============================================================
#atividade(
  "1", "Agenda telefônica em Flask",
  descricao: "Nivelamento em sala: sistema monolítico Flask + Jinja com persistência em JSON.",
  planejada: "07/08/2026",
  realizada: "07/08/2026 21:06",
  situacao: "entregue",
  evidencia: "Realizada em sala — GitHub, repositório Aula1-Cloud, commit ed9a4dc (07/08/2026 21:06) + print do sistema rodando localmente",
  url: "https://github.com/VMarquesin/Aula1-Cloud/commit/ed9a4dcb47e5b364fc339f46ef61697e208cfd6f",
)[
  *O que foi feito.* Desenvolvimento de uma API fundamental utilizando Python e o microframework Flask. A aplicação consistia em uma agenda telefônica simples para introduzir os conceitos de rotas web, requisições HTTP e manipulação básica de dados em memória ou estruturas simples, servindo como aquecimento para a disciplina.

  #evidencia(arquivo: "prints/commit-1.png", [Atividade 1 — Evidência do commit])
  #evidencia(arquivo: "prints/sistema-1.png", [Atividade 1 — Sistema funcionando])

  *Dificuldades e como foram resolvidas.* A principal dificuldade inicial foi a configuração do ambiente Python e o entendimento da estrutura de roteamento do Flask. Isso foi superado através da consulta à documentação oficial, uso de IA e do acompanhamento dos exemplos práticos desenvolvidos em sala, melhorando a base para o desenvolvimento de APIs.
]

#atividade(
  "2", "Catálogo de filmes — Tom Hanks",
  descricao: "Consumo da API TMDB, persistência em MariaDB e segregação por usuário.",
  planejada: "20/08/2026",
  realizada: "16/08/2026 19:52",
  situacao: "entregue",
  evidencia: "GitHub — commits e991412 (16/08/2026 13:26) e 9b94195 (16/08/2026 19:52) + README + print do catálogo",
  url: "https://github.com/VMarquesin/CutelariaMarquesin/commit/e991412f81e88b858d7d8a384700e37869d8ff4f"
)[
  *O que foi feito.* O requisito original do catálogo de filmes foi adaptado para o contexto do projeto "Cutelaria Marquesin". Foi desenvolvida uma aplicação com frontend em React e backend capaz de listar referências de lâminas, conectando-se a APIs externas (como o Unsplash) para buscar imagens, e permitindo ao usuário favoritar e comentar itens.

  #evidencia(arquivo: "prints/commit-2.png", [Atividade 2 — Evidência do commit])
  #evidencia(arquivo: "prints/preferencias_Admin.png", [Atividade 2 — Sistema funcionando: painel de referências (catálogo) com itens salvos pelo usuário])

  *Dificuldades e como foram resolvidas.* O maior desafio foi estruturar o estado da aplicação no React de forma eficiente e garantir a comunicação correta com a API externa sem expor chaves sensíveis. A solução foi isolar a chamada da API externa no backend (Node.js), servindo os dados tratados para o frontend, garantindo segurança e melhor performance.
]

#atividade(
  "3", "Desacoplando o login — microsserviço de autenticação",
  descricao: "Login, cadastro e esqueci-minha-senha num serviço à parte na rede interna do Docker.",
  planejada: "28/08/2026",
  realizada: "27/08/2026 20:38",
  situacao: "entregue",
  evidencia: "GitHub — commits 24151a1 (25/08/2026 22:21) e f56749d (27/08/2026 20:38) + docker-compose.yml + print do login funcionando",
  url: "https://github.com/VMarquesin/CutelariaMarquesin/commit/24151a15cc0ca5d71d06d03e5d67bc02926c1a25",
)[
  *O que foi feito.* Refatoração da arquitetura para a extração do módulo de usuários do monolito original. Foi criado o `auth-service`, um microsserviço isolado em Node.js responsável exclusivamente por cadastro, login e geração de tokens JWT (JSON Web Tokens). O serviço original do catálogo passou a atuar como um API Gateway, roteando requisições de `/auth` para o novo serviço.

  #evidencia(arquivo: "prints/commit-3.png", [Atividade 3 — Evidência do commit])
  #evidencia(arquivo: "prints/login.png", [Atividade 3 — Sistema funcionando: tela de login, autenticada pelo auth-service via API Gateway])

  *Dificuldades e como foram resolvidas.* A comunicação entre os containers Docker falhava porque o backend tentava acessar `localhost` em vez da rede interna. O problema foi resolvido configurando a rede `bridge` no `docker-compose.yml` e utilizando o nome do serviço (`auth-service:3001`) como resolução de DNS interno para as requisições do proxy.
]

#atividade(
  "4", "Controle de acesso por papel — RBAC",
  descricao: "O campo role passa a decidir permissões reais no backend (403 para usuário comum).",
  planejada: "04/09/2026",
  realizada: "03/09/2026 21:02",
  situacao: "entregue",
  evidencia: "GitHub — commit c43adaa (03/09/2026 21:02) + print do 403 e da ação de admin",
  url: "https://github.com/VMarquesin/CutelariaMarquesin/commit/f56749d53bc73627e0c46db2473e904ca40cb5c9",
)[
  *O que foi feito.* Implementação do modelo _Role-Based Access Control_ (Padrão B — Claims no JWT). A tabela de usuários foi atualizada para suportar perfis (roles) como 'admin'. O JWT gerado pelo `auth-service` passou a embutir essa _claim_. Foram criados middlewares no backend para interceptar requisições críticas, garantindo que apenas administradores pudessem acessar rotas sensíveis (gerando erro 403 Forbidden para acessos indevidos).

  #evidencia(arquivo: "prints/commit-4.png", [Atividade 4 — Evidência do commit])
  #evidencia(arquivo: "prints/403.png", [Atividade 4 — Sistema funcionando: usuário comum recebe 403 ao acessar área restrita])
  #evidencia(arquivo: "prints/listar_usuarios.png", [Atividade 4 — Sistema funcionando: ação de admin (listagem de usuários e promoção de papel)])

  *Dificuldades e como foram resolvidas.* Garantir que o cabeçalho de `Authorization` (Bearer Token) fosse repassado corretamente pelo API Gateway sem ser descartado. Foi necessário ajustar a configuração do proxy reverso no Catálogo para preservar os _headers_ originais da requisição do cliente até o serviço de autenticação.
]

#atividade(
  "5", "Logs e auditoria",
  descricao: "Novo log-service com Redis registrando login, ações sensíveis e tentativas negadas.",
  planejada: "25/09/2026",
  realizada: "07/09/2026 11:44",
  situacao: "entregue",
  evidencia: "GitHub — commits cd04f83 (07/09/2026 11:11) e a4fd2a4 (07/09/2026 11:44) + print da consulta de logs pelo admin",
  url: "https://github.com/VMarquesin/CutelariaMarquesin/commit/cd04f83ebb690d07b16616037c50ead9aa5f917e"
)[
  *O que foi feito.* Implementação de uma arquitetura orientada a eventos (Producer/Consumer) para observabilidade. Foi inserido um container do Redis atuando como fila de mensagens (Redis Streams). O `auth-service` e o `catalogo-api` foram configurados como produtores, disparando logs de ações (logins, erros, favoritos). Um novo microsserviço (`log-service`) foi criado como consumidor assíncrono para ler a fila e persistir a auditoria para visualização em um painel administrativo no frontend.

  #evidencia(arquivo: "prints/commit-5.png", [Atividade 5 — Evidência do commit])
  #evidencia(arquivo: "prints/logs.png", [Atividade 5 — Sistema funcionando: consulta dos registros de auditoria pelo admin])

  *Dificuldades e como foram resolvidas.* Assegurar que a geração de logs não causasse lentidão ou gargalo (Time-out) na resposta principal ao usuário. A solução arquitetural foi a adoção do Redis Streams, permitindo operações de escrita (XADD).
]

#atividade(
  "6", "Upload e perfil de usuário",
  descricao: "Página de perfil com avatar no MinIO; só a referência fica no banco relacional.",
  planejada: "02/10/2026",
  realizada: "02/10/2026 23:04",
  situacao: "entregue",
  evidencia: "GitHub — commits 722da1d (02/10/2026 21:47) e b72a6a4 (02/10/2026 23:04) + print do perfil com foto",
  url: "https://github.com/VMarquesin/CutelariaMarquesin/commit/722da1d26aee656ddd3f8ccbfcdec"
)[
  *O que foi feito.* Transição do armazenamento de arquivos de uma abordagem relacional para Object Storage S3-Compatible utilizando o MinIO (`pgsty/minio`). O container foi configurado na rede privada (sem portas expostas externamente). O upload processa imagens em `multipart/form-data` via memória (`multer`) e envia os binários ao MinIO, gravando apenas a URL de referência no MariaDB. Foi implementado o bloqueio anti-IDOR, garantindo que a edição do perfil dependa estritamente do ID do JWT, e não do corpo da requisição.

  #evidencia(arquivo: "prints/commit-6.png", [Atividade 6 — Evidência do commit])
  #evidencia(arquivo: "prints/meuperfil.png", [Atividade 6 — Sistema funcionando: perfil com foto armazenada no MinIO])

  *Dificuldades e como foram resolvidas.* O principal desafio técnico foi o corrompimento do binário da imagem pelo API Gateway (Catálogo), que tentava desserializar a requisição como JSON, além do bloqueio de portas públicas. A solução exigiu que o MinIO fosse isolado internamente, e as rotas de proxy de ida e volta foram reescritas para utilizar fluxos de rede nativos (`req.pipe(proxyReq)` e `responseType: 'stream'`), garantindo que o _buffer_ binário viajasse intacto entre o navegador, o proxy e o AuthService.
]

// ============================================================
= Considerações finais
// ============================================================
O desenvolvimento deste projeto consolidou uma transição fundamental: a passagem da escrita de código básico para o desenho de arquiteturas de sistemas distribuídos. Mais do que aprender a sintaxe de uma linguagem, o bimestre exigiu a compreensão de redes Docker, comunicação inter-processos, gerenciamento de estado entre microsserviços e segurança em trânsito (JWT, RBAC). Lidar com a infraestrutura diretamente no Portainer trouxe uma visão dos desafios de DevOps.

A maior lição técnica do período foi sobre arquitetura e a natureza dos protocolos de rede. Problemas como conflitos de portas em servidores compartilhados e a corrupção de _streams_ binários por proxies mal configurados (durante a integração com o MinIO) provaram que um sistema escalável exige decisões de design (como o isolamento do Object Storage sem exposição pública). Hoje, a Cutelaria Marquesin possui uma fundação mais sólida e estruturada para crescer de maneira segura e independente.

// ============================================================
= Declaração de autoria
// ============================================================
Declaro que este relatório foi elaborado por mim, individualmente, e que as evidências apresentadas correspondem a entregas de minha autoria, verificáveis nos links informados. Nas atividades realizadas em grupo, o conteúdo aqui descrito refere-se à minha participação.

#v(1.5cm)
#grid(
  columns: (1fr, 1fr), gutter: 2cm,
  align(center)[#line(length: 100%, stroke: 0.5pt) \ #aluno],
  align(center)[#line(length: 100%, stroke: 0.5pt) \ Pompeia, #data-relatorio],
)
