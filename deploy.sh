#!/bin/sh

# This is a script used for a post-push Git hook to build and deploy the
# gh-pages branch.
# I snagged it off fortunejs's repo. Thanks to that!
#   https://github.com/fortunejs/fortune/blob/master/website/deploy.sh


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
