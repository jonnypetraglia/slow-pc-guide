#!/bin/sh

REPO_GIT=git@github.com:notbryant/slow-pc-guide.git
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )


# Deploying to GitHub pages.
(cd "$DIR/dist"; \
	[ ! -d .git ] && \
		git init && \
		git remote add origin $REPO_GIT &&
		git checkout -b gh-pages; \
	git add -A && \
	git commit -m 'Update website from deploy script.' && \
	git push -u origin gh-pages --force)
