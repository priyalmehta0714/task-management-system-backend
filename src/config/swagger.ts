import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real-Time Task Management System API',
      version: '1.0.0',
      description: 'Production API blueprint routing user operations, strict validations, and granular task access control mappings.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste your alphanumeric JWT token directly in the field to authorize protected sessions.',
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register a new system user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Test User' },
                    email: { type: 'string', example: 'test.user@yopmail.com' },
                    password: { type: 'string', example: 'Test@123' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'User registered successfully' },
            400: { description: 'Validation schema checks failed' },
            409: { description: 'Email is already registered' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Authenticate user and return a JWT access token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'test.user@yopmail.com' },
                    password: { type: 'string', example: 'Test@123' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Login successful, returns token' },
            401: { description: 'Invalid email or password credentials' }
          }
        }
      },
      '/api/tasks': {
        post: {
          summary: 'Create a new task (Admin Only)',
          tags: ['Tasks Management'],
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'assignedTo', 'dueDate'],
                  properties: {
                    title: { type: 'string', example: 'Setup Production Server' },
                    description: { type: 'string', example: 'Configure load balancers and domain certificates' },
                    status: { type: 'string', enum: ['todo', 'in-progress', 'done'], example: 'todo' },
                    priority: { 
                      type: 'integer', 
                      enum:[1,2,3], 
                      description: '1 = High, 2 = Medium, 3 = Low', 
                      example: 1 
                    },
                    assignedTo: { type: 'string', description: '24-character hex MongoDB ObjectId of assigned User', example: '65cb76e289bc2312345678ab' },
                    dueDate: { type: 'string', example: '2026-08-30T12:00:00.000Z' }
                  }
                }
              }
            }
          },
          responses: { 
            201: { description: 'Created successfully' }, 
            400: { description: 'Validation failed' },
            403: { description: 'Forbidden. Admin access required' } 
          }
        },
        get: {
          summary: 'Get filtered tasks list with search and pagination parameters',
          tags: ['Tasks Management'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page segment index' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Items count per page window view' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Text matching string tracking against task title/description' },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['todo', 'in-progress', 'done'] }, description: 'Filter by current operational state' },
            { name: 'priority', in: 'query', schema: { type: 'integer', enum: [1, 2, 3] }, description: 'Filter by numeric priority layer (1=High, 2=Medium, 3=Low)' }
          ],
          responses: { 
            200: { description: 'Success. Admins fetch all records; developers receive exclusively tasks bound to their account.' } 
          }
        }
      },
      '/api/tasks/{id}': {
        put: {
          summary: 'Update entire task records comprehensively (Admin Only)',
          tags: ['Tasks Management'],
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Task document identifier' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Updated Server Infrastructure Task Title' },
                    description: { type: 'string', example: 'Updated Description string parameters' },
                    status: { type: 'string', enum: ['todo', 'in-progress', 'done'], example: 'review' },
                    priority: { type: 'integer', enum:[1,2,3], example: 2 },
                    assignedTo: { type: 'string', example: '65cb76e289bc2312345678ab' },
                    dueDate: { type: 'string', example: '2026-08-30T12:00:00.000Z' }
                  }
                }
              }
            }
          },
          responses: { 
            200: { description: 'Task profile altered successfully' }, 
            403: { description: 'Admin Access Required' }, 
            404: { description: 'Task record target not found' } 
          }
        },
        delete: {
          summary: 'Hard delete a task out of collections (Admin Only)',
          tags: ['Tasks Management'],
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Task document identifier' }],
          responses: { 
            200: { description: 'Deleted cleanly out of database instance' }, 
            403: { description: 'Admin Access Required' }, 
            404: { description: 'Task record target not found' } 
          }
        }
      },
      '/api/tasks/{id}/status': {
        patch: {
          summary: 'Update status of assigned task item',
          tags: ['Tasks Management'],
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Task document identifier' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: { 
                    status: { type: 'string', enum: ['todo', 'in-progress', 'done'], example: 'in-progress' } 
                  }
                }
              }
            }
          },
          responses: { 
            200: { description: 'Status updated successfully' },
            403: { description: 'Access Denied. Standard users can only alter tasks bound explicitly to them.' },
            404: { description: 'Task record target not found' }
          }
        }
      },
      '/api/tasks/statistics': {
        get: {
          summary: 'Retrieve operational task metrics and breakdowns (Admin Only)',
          tags: ['Tasks Management'],
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Successfully computed metrics aggregation array data models.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'object',
                        properties: {
                          total: { type: 'integer', example: 45 },
                          statusBreakdown: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: { _id: { type: 'string', example: 'in-progress' }, count: { type: 'integer', example: 12 } }
                            }
                          },
                          priorityBreakdown: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: { _id: { type: 'integer', example: 1 }, count: { type: 'integer', example: 5 } }
                            }
                          },
                          upcomingDeadlines7Days: { type: 'integer', example: 3 }
                        }
                      }
                    }
                  }
                }
              }
            },
            403: { description: 'Access Denied. Admins privileges required.' }
          }
        }
      },
      '/api/tasks/users/{id}/performance': {
        get: {
          summary: 'Retrieve targeted user performance report metrics (Admin Only)',
          tags: ['Tasks Management'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { 
              name: 'id', 
              in: 'path', 
              required: true, 
              schema: { type: 'string' }, 
              description: 'The 24-character hexadecimal MongoDB ObjectId of the target User' 
            }
          ],
          responses: {
            200: {
              description: 'Successfully generated individual user performance analysis.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: '65cb76e289bc2312345678ab' },
                          name: { type: 'string', example: 'Jane Doe' },
                          email: { type: 'string', example: 'jane.doe@example.com' },
                          role: { type: 'string', example: 'developer' },
                          totalTasksAssigned: { type: 'integer', example: 5 },
                          onTimeCompletionPercentage: { type: 'number', example: 80.00 }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: { description: 'Invalid target User ID structure provided' },
            403: { description: 'Access Denied. Admin privileges required.' },
            404: { description: 'User record target not found' }
          }
        }
      },
      '/api/tasks/search': {
        get: {
          summary: 'Search tasks locally by title/description via Regex matching',
          tags: ['Tasks Management'],
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Keyword query search parameter' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: {
            200: { description: 'Results fetched successfully, sorted by most recently updated tasks.' },
            400: { description: 'Missing required keyword parameter q' }
          }
        }
      }



    }
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📖 Swagger UI documentation available at: http://localhost:3000/api-docs');
};
