up:
	cd Backend && docker-compose up -d

down:
	cd Backend && docker-compose down

restart:
	cd Backend && docker-compose down && docker-compose up -d

logs:
	cd Backend && docker-compose logs -f

run-server:
	cd Backend && node server.js

dev:
	cd Frontend && cd eve-market && npm run dev