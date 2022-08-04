import { expect } from 'chai'
import { ethers } from 'hardhat'

const { expectRevert } = require('@openzeppelin/test-helpers')

describe('ANIV20 Test', function () {
	let proxyRegistryAddress: any
	let contract: any

	beforeEach(async () => {
		;[proxyRegistryAddress] =
			await ethers.getSigners()
		const ANIV721Land = await ethers.getContractFactory('ANIV721Land')
		contract = await ANIV721Land.deploy(proxyRegistryAddress.address)
		await contract.deployed()
	})

	it('name, symbol, decimals, totalSupply, balanceOf', async () => {
		expect(await contract.name()).to.equal('Aniverse')
		expect(await contract.symbol()).to.equal('ANIV')

	})

})
