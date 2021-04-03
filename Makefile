

up:
	docker-compose up -d
down:
	docker-compose down
start:
	npm run dev
install:
	npm i
watch:
	npm run watch:build
watch-test:
	npm run watch:test
patch:
	npm run version-patch && git push --follow-tags origin main
minor:
	npm run version-minor && git push --follow-tags origin main
major:
	npm run version-major && git push --follow-tags origin main

.PHONY: up down start install watch watch-test patch major minors
