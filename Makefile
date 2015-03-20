run:
	./index.js

test:
	rm -f ./test/flycheck*.js
	./node_modules/.bin/mocha --colors --ui tdd --reporter spec --check-leaks | ./node_modules/.bin/simple-stacktrace

.dep-tags: ./node_modules
	rm .dep-tags
	DEP_DIR='node_modules' rebuild-tags

.PHONY: test run
