.PHONY: check test build build-image run-dashboard build-seo deploy-kingu

check:
	PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 cargo check

test:
	PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 cargo test

build:
	PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1 cargo build --release

build-image:
	podman build -t micelia-cortex:latest -f ../Dockerfile ..

run-dashboard:
	@echo "Para ver el dashboard local, abre file://$(shell pwd)/dashboard/index.html en tu navegador."

build-seo:
	node dashboard/scripts/build-seo-pages.mjs

deploy-kingu:
	ssh kingu "mkdir -p ~/proyectos/micellia"
	rsync -avz --exclude 'target' --exclude '.git' --exclude '.cargo' --exclude '.github' ../ kingu:~/proyectos/micellia/
	ssh kingu "cd ~/proyectos/micellia && podman compose up -d --build"

