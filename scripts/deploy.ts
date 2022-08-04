import { ethers } from 'hardhat'

async function main() {
	const ANIV721Land = await ethers.getContractFactory('ANIV721Land')
	const contract = await ANIV721Land.deploy('0xE21FE194bf246fAA38F6CB639E7ED55D5cF949e2');
	await contract.deployed()
	console.log('Token address:', contract.address)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
