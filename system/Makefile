.PHONY: check test build run-dashboard build-seo

check:
	PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 cargo check

test:
	PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 cargo test

build:
	PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 cargo build --release

run-dashboard:
	@echo "Para ver el dashboard local, abre file:///home/jnovoas/Dev/micellia/system/dashboard/index.html en tu navegador."

build-seo:
	node dashboard/scripts/build-seo-pages.mjs

deploy:
	ssh fan "mkdir -p ~/micellia"
	rsync -avz --exclude 'target' --exclude '.git' --exclude '.cargo' --exclude '.github' ./ fan:~/micellia/
	rsync -avz dashboard/ fan:/var/www/micelia.cl/dashboard/
	ssh fan "cd ~/micellia && PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 ~/.cargo/bin/cargo build --release"
