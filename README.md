# NestJS Backend Utility Service

## Overview

This project is a comprehensive backend utility service built with NestJS, implementing a robust 3-layer architecture. It provides a wide range of functionalities including API management, worker processes, blockchain interactions, AI capabilities, game services, and multi-storage data management.

## Table of Contents

- [NestJS Backend Utility Service](#nestjs-backend-utility-service)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Architecture](#architecture)
    - [1. Access (Gateway) Layer](#1-access-gateway-layer)
      - [**Restful API Implementation**](#restful-api-implementation)
      - [**WebSocket Gateway**](#websocket-gateway)
      - [**JSON-RPC**](#json-rpc)
      - [**Telegram Bot Integration**](#telegram-bot-integration)
    - [2. Executor (Business) Layer](#2-executor-business-layer)
      - [**Worker Processes**](#worker-processes)
      - [**Blockchain Integration**](#blockchain-integration)
      - [**AI Capabilities**](#ai-capabilities)
      - [**Game Services**](#game-services)
    - [3. Data Layer](#3-data-layer)
    - [4. Others](#4-others)
      - [Service Communication](#service-communication)
      - [Worker Thread Integration](#worker-thread-integration)
      - [Resilience Patterns](#resilience-patterns)
      - [Crawler Module](#crawler-module)
      - [Docker Support](#docker-support)
      - [Google Cloud Build](#google-cloud-build)
  - [Technologies Used](#technologies-used)
  - [Getting Started](#getting-started)
  - [Contact](#contact)

## Architecture

The project follows a 3-layer architecture:

1. **Access (Gateway) Layer**
2. **Business (Executor) Layer**
3. **Data Layer**

### 1. Access (Gateway) Layer

This layer handles incoming requests and implements various middleware and utilities:

#### **Restful API Implementation**
  - Guards: JWT authentication and RBAC (Role-Based Access Control) for secure access
  - Rate Limiter: Prevents API abuse by limiting request frequency
  - Interceptors:
    - Request caching: Improves performance by caching frequently accessed data
    - Response formatting: Ensures consistent API responses
    - Context awareness: Provides request-specific information to handlers
    - Swagger integration: Automatically generates API documentation
    - Integrates structured logging into request and response cycles, allowing for better tracking and debugging of API calls.
  - Exception filters: Customize error handling for consistent error responses
  - Pipes: For input validation and data transformation

#### **WebSocket Gateway**
  - Socket.IO with Redis Adapter: Enables real-time, bidirectional communication with scalability, allowing multiple server instances for efficient message distribution.
  - Channel management by rooms: Organizes connections for efficient message distribution
  - Message compression: Reduces bandwidth usage for real-time communications

#### **JSON-RPC**
  - The `JRPCModule` provides a JSON-RPC interface for the application. It is configured to handle requests at the `/rpc` endpoint.
  - **Handlers**: `DomainHandler` which acts like a controller in a RESTful API to manage requests.

#### **Telegram Bot Integration**
  - Socket-based listener and responder: Enables real-time interaction with Telegram
  - Multiple interactive functions: Provides various bot commands and features
  - Internationalization (i18n) support: Allows multi-language bot responses

### 2. Executor (Business) Layer

This layer contains the core business logic and processing:

#### **Worker Processes**
  - Schedulers: Manage time-based tasks and recurring jobs
  - BullMQ consumers: Handle background processing and job queues
#### **Blockchain Integration**
  - Smart contract interactions: Allows the service to interact with blockchain-based applications
  - Transaction synchronization: Keeps the service in sync with blockchain state

#### **AI Capabilities**
  - RAG (Retrieval-Augmented Generation) pipeline: Enhances AI responses with relevant retrieved information
  - LLM (Large Language Model) integration: Enables advanced natural language processing
  - Function calling with LangChain.js: Allows dynamic execution of functions based on AI input
  - Performance monitoring with Langfuse: Tracks and optimizes AI model performance

#### **Game Services**
  - Authorization game server using Colyseus: Manages game session authentication, ensures real-time synchronization of game state with clients.
  - Turn-based game lifecycle framework: Provides structure for implementing core game loop for turn-based games

### 3. Data Layer

This layer manages data storage and retrieval across multiple databases:

- PostgreSQL: Primary relational database for structured data
- TypeORM: An ORM for TypeScript that simplifies database interactions with PostgreSQL
- TimescaleDB: Time-series database for handling time-based data efficiently
- Redis: In-memory data structure store for caching and real-time operations
- pgvector: Enables vector similarity search in PostgreSQL
- Milvus: Distributed vector database for large-scale similarity search
- Firestore: NoSQL database for flexible, scalable data storage
- Elasticsearch: Full-text search and analytics engine
- Google Cloud Storage: Used for file uploads and storage

### 4. Others
#### Service Communication
The project implements multiple methods for service communication:

- RabbitMQ: Message broker for reliable inter-service communication
- Redis Pub/Sub: For lightweight, real-time messaging between services
- Google Pub/Sub: Scalable, fully-managed messaging service for larger deployments

#### Worker Thread Integration
To enhance performance and prevent blocking the main event loop, the project incorporates a worker thread for thread pool (heavy computations, file I/O, CPU-bound, ...) tasks. This ensures that the main thread remains responsive to I/O and network requests. The worker thread implementation leverages Node.js's `worker_threads` module, enabling parallel execution and improved application throughput.

#### Resilience Patterns

Reliable patterns for building resilient applications using `nestjs-resilience`: Provides strategies to ensure that application can handle failures and recover quickly, improving the reliability and fault-tolerance of services: Circuit Breaker, Retry, Timeout, Bulkhead, Fallback, Rate Limiting.

#### Crawler Module
Implements scraper proxies for data collection from various sources, enhancing the ability to gather and process information from external websites: DexTools, DexScreener, RapidAPI, Twitter, CoinGecko, ...

#### Docker Support

The project includes Docker configurations for all services and monitoring tools in the `docker-compose.yml` file, enabling easy deployment and scaling of the entire application stack.

#### Google Cloud Build
Includes `cloudbuild.yaml` file for triggering Google Cloud Build, facilitating containerization for deployment on Cloud Run and virtual machines (VMs). The configuration automates the build process, ensuring that the application is packaged and deployed efficiently.

## Technologies Used

- NestJS: A progressive Node.js framework for building efficient and scalable server-side applications
- BullMQ: Redis-based queue for handling distributed jobs and messages
- LangChain.js: Framework for developing applications powered by language models
- Colyseus: Multiplayer game framework for Node.js
- Elasticsearch: Distributed search and analytics engine
- OneSignal: Cross-platform push notification service
- Google Cloud Storage: Object storage service by Google Cloud

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/kiyoshitaro/app-server.git
   ```

2. Install dependencies:
   ```
   cd app-server
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.sample .env
   ```
   Edit the `.env` file with your configuration details.

4. Start the development server:
   ```
   npm run start:dev
   ```

5. For Docker deployment, use:
   ```
   bash start.sh
   ```

## Contact

For any inquiries, please contact [Hung Nguyen](mailto:hunglhp1998@gmail.com).