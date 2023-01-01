# FTTS Cancellation Api

This API application is responsible for the orchestration of the booking cancellation process.
See `https://dvsa.atlassian.net/wiki/spaces/FB/pages/68255863/0016.+Cancellation+API#Problem-Statements` for further details.

## Runtime

NodeJS >=16.x

## Language

Typescript 4.8.x

## Build and run

### Install packages

```bash
npm install
```

### Run the app locally via Azure CLI tools

Create a local.settings.json by running:

```bash
npm run copy-config
```

Run the api locally

```bash
npm run func:start
```

Clean installs, builds and runs the app. hosted at `http://localhost:7072/api/v1/cancel`

### Clean build the app

```bash
npm run build
```

### Generate coverage report

```bash
npm run test:coverage