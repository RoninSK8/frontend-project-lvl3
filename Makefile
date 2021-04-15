install:
	npm install

link:
	npm link

lint:
	npx eslint .

webpack:
	npx webpack.config.js

build:
	webpack --mode production