import { ethers } from "hardhat"

async function main() {
    const ANIV721Land = await ethers.getContractFactory("ANIV721Land")
    const contract = await ANIV721Land.deploy(
        "0xf57b2c51ded3a29e6891aba85459d600256cf317",
        30000
    )
    try {
        await contract.deployed()
        console.log("Token address:", contract.address)
        // const newItemId = await contract.mint(
        //     "0x176d29eD0952E41e38d83D543473e5Bb24E68F13",
        //     "https://ipfs.io/ipfs/QmYxxGUadhu7snGVZunRKoRzGtkXPGmZsNnBywPNjgSQLo"
        // )
        // await contract.stopOpenseaProxy()
        const newItemId = await contract.mint(
            "0x176d29eD0952E41e38d83D543473e5Bb24E68F13",
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
