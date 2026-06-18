# NestJS Dockerized Application

## Environment Setup

Create a `.env` file in the project root using `.env.example` as a template.


---

## Running the Application

Install dependencies:

```bash
yarn install
```

Start the application in development mode:

```bash
yarn start:dev
```

---

## Running the Application with Docker

Build the application image and start all Docker services:

```bash
docker compose up --build
```

This starts:

* NestJS application
* PostgreSQL database
* Redis
* RabbitMQ

The application will be available at:

* API: `http://localhost:3000`
* RabbitMQ Management UI: `http://localhost:15672`

To stop all services:

```bash
docker compose down
```

To remove containers and volumes (this will delete PostgreSQL data):

```bash
docker compose down -v
```

---


## Running Tests

Run unit tests:

```bash
yarn test
```
---

## Docker Services

The project contains the following services:

| Service                | Purpose              | Port  |
| ---------------------- | -------------------- | ----- |
| NestJS                 | REST API             | 3000  |
| PostgreSQL             | Database             | 5432  |
| Redis                  | Cache storage        | 6379  |
| RabbitMQ               | Message broker       | 5672  |
| RabbitMQ Management UI | Monitoring interface | 15672 |
|                        |                      |       |
