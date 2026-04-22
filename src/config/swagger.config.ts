import swaggerJsdoc, { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Olivia Karp Backend API",
      version: "1.0.0",
      description:
        "Enterprise-grade backend API documentation for Olivia Karp / Act On Climate. Covers Auth, Subscriptions, Courses, Events, and more.",
      contact: {
        name: "Developer Support",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
      {
        url: "https://api.actonclimate.co",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from the login endpoint.",
        },
      },
      responses: {
        BadRequest: {
          description: "Invalid request payload or parameters",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        Unauthorized: {
          description: "Unauthorized - Invalid or missing JWT token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        NotFound: {
          description: "The requested resource was not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message details",
            },
            statusCode: {
              type: "integer",
              example: 400,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Dynamically pull all JSDoc annotations from all route and component files
  apis: [
    "./src/modules/**/*.router.ts",
    "./src/modules/**/*.routes.ts",
    "./src/modules/**/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
