import { ethers } from "hardhat"

async function main() {
    const ANIV721Land = await ethers.getContractFactory("ANIV721Land")
    // "0xff7Ca10aF37178BdD056628eF42fD7F799fAc77c", // proxy on polygon mumbai
    // "0xf57b2c51ded3a29e6891aba85459d600256cf317", // proxy on rinkeby
    const contract = await ANIV721Land.deploy(
        "0xf57b2c51ded3a29e6891aba85459d600256cf317",
        30000
    )
    try {
        await contract.deployed()
        console.log("Token address:", contract.address)
        const newItemId = await contract.mint(
            "0xa4185e56993971325B5089F7bBde7EF25dC82856",
            4331
        )

        console.log(`NFT minted successfully with id ${newItemId}`)
    } catch (error: any) {
        console.log(`Minting Error: ${error.message}`)
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
