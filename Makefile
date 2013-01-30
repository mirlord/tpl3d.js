
lint:
	echo xxx
	./node_modules/.bin/grunt lint

tap:
	node_modules/.bin/tap ${TAP_OPTS} test/*.js

tap-debug:
	$(MAKE) tap TAP_OPTS='--stderr --diag'

all: tap lint

.SILENT:

.PHONY: all

# End of file

