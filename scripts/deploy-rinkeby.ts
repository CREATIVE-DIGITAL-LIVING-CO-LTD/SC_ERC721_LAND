import { ethers } from "hardhat"

const { PROXY_REGISTRY_RINKEBY, ADDRESS_TESTNET, BASE_TOKEN_URI } = process.env

async function main() {
    const ANIV721Land = await ethers.getContractFactory("ANIV721Land")
    // "0xff7Ca10aF37178BdD056628eF42fD7F799fAc77c", // proxy on polygon mumbai
    // "0xf57b2c51ded3a29e6891aba85459d600256cf317", // proxy on rinkeby
    const contract = await ANIV721Land.deploy(
        PROXY_REGISTRY_RINKEBY!,
        30000,
        BASE_TOKEN_URI!
    )
    try {
        await contract.deployed()
        console.log("Token address:", contract.address)
        await contract.addOperator("0x0624A92eDF1A32b4c6CafD292De8D00c6527C0A1")
        const newItemId = await contract.mint(ADDRESS_TESTNET!, 666)
        console.log({
            newItemId,
        })
    } catch (error: any) {
        console.log(`Minting Error: ${error.message}`)
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
