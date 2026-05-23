const spec = {
  openapi: "3.0.3",
  info: {
    title: "Aurora Bank API",
    version: "1.0.0",
    description: "API bancaria v1 con JWT, refresh token, transferencias y endpoints administrativos."
  },
  servers: [
    {
      url: "http://127.0.0.1:4000",
      description: "Servidor local"
    }
  ],
  tags: [
    { name: "Auth" },
    { name: "Me" },
    { name: "Transfers" },
    { name: "Admin" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string"
          }
        }
      },
      Session: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
          account: { $ref: "#/components/schemas/Account" }
        }
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          fullName: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["admin", "user"] },
          status: { type: "string", enum: ["active", "blocked"] },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Account: {
        type: "object",
        properties: {
          id: { type: "integer" },
          userId: { type: "integer" },
          accountNumber: { type: "string" },
          balance: { type: "number" },
          currency: { type: "string" },
          status: { type: "string", enum: ["active", "blocked"] },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Transfer: {
        type: "object",
        properties: {
          id: { type: "integer" },
          amount: { type: "number" },
          reference: { type: "string" },
          status: { type: "string" },
          senderBalanceAfter: { type: "number" },
          receiverBalanceAfter: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
          sender: {
            type: "object",
            properties: {
              accountNumber: { type: "string" },
              userName: { type: "string" },
              userEmail: { type: "string" }
            }
          },
          receiver: {
            type: "object",
            properties: {
              accountNumber: { type: "string" },
              userName: { type: "string" },
              userEmail: { type: "string" }
            }
          }
        }
      }
    }
  },
  paths: {
    "/health": {
      get: {
        summary: "Estado del backend",
        responses: {
          200: {
            description: "Servicio disponible"
          }
        }
      }
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar usuario",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password"],
                properties: {
                  fullName: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Usuario registrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            }
          }
        }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Sesion iniciada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            }
          }
        }
      }
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Renovar sesion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Sesion renovada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Session" }
              }
            }
          }
        }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Cerrar sesion",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  refreshToken: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Sesion cerrada"
          }
        }
      }
    },
    "/me": {
      get: {
        tags: ["Me"],
        security: [{ bearerAuth: [] }],
        summary: "Perfil del usuario autenticado",
        responses: {
          200: {
            description: "Perfil y cuenta",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    account: { $ref: "#/components/schemas/Account" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/me/account": {
      get: {
        tags: ["Me"],
        security: [{ bearerAuth: [] }],
        summary: "Cuenta principal del usuario",
        responses: {
          200: {
            description: "Cuenta principal",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Account" }
              }
            }
          }
        }
      }
    },
    "/me/transfers": {
      get: {
        tags: ["Transfers"],
        security: [{ bearerAuth: [] }],
        summary: "Historial de transferencias del usuario",
        responses: {
          200: {
            description: "Lista de transferencias",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Transfer" }
                }
              }
            }
          }
        }
      }
    },
    "/transfers": {
      post: {
        tags: ["Transfers"],
        security: [{ bearerAuth: [] }],
        summary: "Crear transferencia",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["destinationAccountNumber", "amount"],
                properties: {
                  destinationAccountNumber: { type: "string" },
                  amount: { type: "number" },
                  reference: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Transferencia realizada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Transfer" }
              }
            }
          }
        }
      }
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Listado de usuarios",
        responses: {
          200: {
            description: "Usuarios con su cuenta principal"
          }
        }
      }
    },
    "/admin/users/{id}/status": {
      patch: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Activar o bloquear usuario",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["active", "blocked"] }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Estado actualizado"
          }
        }
      }
    },
    "/admin/transfers": {
      get: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Listado global de transferencias",
        responses: {
          200: {
            description: "Transferencias registradas"
          }
        }
      }
    }
  }
};

module.exports = {
  spec
};
