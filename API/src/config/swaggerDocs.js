export const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "API Cutelaria Marquesin",
        version: "1.0.0",
        description: "Documentação da API para a disciplina de Nuvem e gestão da cutelaria."
    },
    servers: [
        {
            url: "https://vinicius-marquesin-isw055.lapps.studio",
            description: "Servidor Nuvem (Produção)"
        },
        {
            url: "http://localhost:3000",
            description: "Servidor Local"
        }
    ],
    security: [{ bearerAuth: [] }],
    paths: {
        "/auth/cadastro": {
            post: {
                summary: "Cadastra um novo usuário",
                tags: ["Autenticação"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    username: { type: "string", example: "nometeste" },
                                    senha: { type: "string", example: "123456" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "201": { description: "Usuário cadastrado com sucesso" },
                    "400": { description: "Erro de validação ou usuário já existente" }
                }
            }
        },
        "/auth/login": {
            post: {
                summary: "Faz login e retorna o token JWT",
                tags: ["Autenticação"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    username: { type: "string", example: "nometeste" },
                                    senha: { type: "string", example: "123456" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Login bem sucedido, retorna o token" },
                    "401": { description: "Usuário ou senha inválidos" }
                }
            }
        },
        "/referencias/buscar": {
            get: {
                summary: "Busca imagens na API do Unsplash",
                tags: ["Referências"],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "query",
                        in: "query",
                        required: true,
                        schema: { type: "string", example: "damascus knife" }
                    }
                ],
                responses: { "200": { description: "Sucesso" }, "401": { description: "Não autorizado" } }
            }
        },
        "/referencias": {
            post: {
                summary: "Salva uma referência no banco",
                tags: ["Referências"],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    unsplashId: { type: "string", example: "XyZ123" },
                                    urlImagem: { type: "string", example: "https://images.unsplash.com/foto-exemplo" },
                                    comentario: { type: "string", example: "Tentar forjar esse padrão de damasco." }
                                }
                            }
                        }
                    }
                },
                responses: { "201": { description: "Sucesso" } }
            },
            get: {
                summary: "Lista as referências salvas do usuário logado",
                tags: ["Referências"],
                security: [{ bearerAuth: [] }],
                responses: { "200": { description: "Sucesso" } }
            }
        }
    }
};