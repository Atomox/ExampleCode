# Git Repo FLOW
> *From Origin -> Upstream -> Deployment*

So, you have a local repo. You forked it off a master repo. You want to setup a flow from:

## local -> bitbucket/github -> dev/stage/prod

### A. If you haven't already: 
  1. Create a master repo in BitBucket or GitHub. 
  2. Make everyone fork that repo, and use their own.
  3. Checkout the fork locally.


### B. Setup Local Machine for a push to a dev environment:

  1. Create a remote to your ORIGINAL/MASTER Repo. That's called an "Upstream"
    - git remote add upstream http://path/to/bitbucket/MASTER/repo


### C. Setup your connection to the dev/stage/prod repo. (similar to above)

  1. Create a remote to the place we push the code to AFTER bitbucket.
    - git remote add cool_name_for_dev_env http://path/to/acquia/repo

  2. Set up a local tracking branch you can use to rebase in before pushing to acquia.
    - git checkout -b cool-branch-name your-dev-remote-name-from-above/master


###  D. Push BitBucket Up to Dev via Local Machine.

   For this exercise, assume the following names:
     upstream = bitbucket master remote from step B.
     acquia = dev/stage/prod remote from step C.
     insight-master = tracking branch to acquia from step C.
     master = your local master branch.

  1.  git checkout master
  2.  git fetch --all --tags
  3.  git reset --hard upstream/master
  4.  git checkout insight-master
  5.  git rebase upstream/master -p
  6.  git fetch acquia
  7.  git rebase acquia/master -p
  8.  git push acquia insight-master:master