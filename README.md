# EVE Market

EVE Market is a project for tracking and analyzing market data in EVE Online.

## Installation

To set up the project, follow these steps:

### Backend
```sh
cd Backend
make up
```

### Frontend
```sh
cd Frontend
cd eve-market
npm install
npm run dev
```

## Usage

To start the project, simply run:
```sh
make dev
```

## Requirements
- Docker
- Node.js
- NPM
- GNU Make

## Environment Variables

Make sure to configure the required environment variables in a `.env` file:

```sh
REDIS_HOST=redis
REDIS_PORT=6379
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.

