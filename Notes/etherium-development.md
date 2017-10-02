# Developing for Etherium

## Libraries & Frameworks

### Geth
Account / Blockchain manager.
### testrpc
Sort of Geth lite. Easier to use.
### Truffle
Development framework to compile / test / deploy smart contracts.
### web3
Javascript library to interact with contracts on the blockchain.


## Setup of Blockchain Pipeline for Local Development
In order to get the blockchain environment setup for your local development, you have some work to do. You'll need to get mining using the `GethBlaster` REPO, setup your contract development environment with `Embark`, which will be used in `IoT-Etherium`, and generate an address, then update the JSONSaver scripts to use this new address.

### GETH:
Start the mining process with GethBlaster. Mining enables us to do updates to the blockchain.
1. Pull down gethBlaster Repo
2. npm run geth
3. miner.start()
4. web3.personal.unlockAccount(eth.accounts[0],'password')

### IoT-Etherium:
Embark is a dev environment blockchain/contract development. For deployment/development.
1. Install embark: npm intall -g embark
2. cd to embark-test/jsonsaver/
3. embark run
4. Look for Status: Deployed in top left.
5. Get the Address, like: 0x79c12e17525ba357da0f0feed9f498725555b627

### GETH:
5. miner.stop()

### IoT-ETH:
6. Go to /scripts/JSONSaver.json, and add your address.
