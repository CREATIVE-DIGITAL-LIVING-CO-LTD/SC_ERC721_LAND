# Project ANIVERSE ERC721

### reference

-   https://github.com/ProjectOpenSea/opensea-creatures

# List command

## start local server

-   npm run start server

## list account local server

-   npm run account

## compile code

-   npm run compile

## test file path ./test

-   npm run test

## deploy local

-   npm run deploy

## deploy polygon testnet

-   npm run deploy:testnet

## deploy polygon mainnet

-   npm run deploy:mainnet

## deploy ethereum testnet rinkeby

-   npm run deploy:rinkeby

## verify contract

### polygon testnet

-   npx hardhat verify `<addr>` `"<proxy address>"` `"<max land>"` --network polygonMumbai

### eth rinkeby

-   npx hardhat verify `<addr>` `"<proxy address>"` `"<max land>"` --network rinkeby
