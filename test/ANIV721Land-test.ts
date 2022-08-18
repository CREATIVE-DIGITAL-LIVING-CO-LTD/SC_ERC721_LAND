import { expect } from "chai"
import { ethers } from "hardhat"

describe("ANIV721 Test", function () {
    let aniv721: any, proxy: any, owner: any, A: any, B: any, C: any
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const baseURI = "https://api-dev.aniv.io/"
    const MAX_LANDS = 30000
    const id1 = 9001
    const id2 = 9002

    beforeEach(async () => {
        ;[owner, A, B, C] = await ethers.getSigners()
        const ANIV721Land = await ethers.getContractFactory("ANIV721Land")
        const MockProxyRegistry = await ethers.getContractFactory(
            "MockProxyRegistry"
        )
        proxy = await MockProxyRegistry.deploy()
        await proxy.connect(owner).setProxy(owner.address, A.address)

        aniv721 = await ANIV721Land.deploy(proxy.address, MAX_LANDS)
        await aniv721.deployed()
    })

    it("correctly mints a NFT", async function () {
        expect(await aniv721.connect(owner).mint(A.address, 1)).to.emit(
            aniv721,
            "Transfer"
        )
        expect(await aniv721.balanceOf(A.address)).to.equal(1)
    })

    it("returns correct balanceOf", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        expect(await aniv721.balanceOf(A.address)).to.equal(1)
        await aniv721.connect(owner).mint(A.address, id2)
        expect(await aniv721.balanceOf(A.address)).to.equal(2)
    })

    it("throws when trying to get count of NFTs owned by 0x0 address", async function () {
        await expect(aniv721.balanceOf(zeroAddress)).to.be.reverted
    })

    it("throws when trying to mint 2 NFTs with the same ids", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        await expect(aniv721.connect(owner).mint(A.address, id1)).to.be.reverted
    })

    it("throws when trying to mint NFT to 0x0 address", async function () {
        await expect(aniv721.connect(owner).mint(zeroAddress, id1)).to.be
            .reverted
    })

    it("finds the correct owner of NFToken id", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        expect(await aniv721.ownerOf(id1)).to.equal(A.address)
    })

    it("throws when trying to find owner od non-existing NFT id", async function () {
        await expect(aniv721.ownerOf(id1)).to.be.reverted
    })

    it("correctly return baseTokenURI", async function () {
        expect(await aniv721.connect(A).baseTokenURI()).to.equal(baseURI)
    })

    it("correctly approves account", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        expect(await aniv721.connect(A).approve(B.address, id1)).to.emit(
            aniv721,
            "Approval"
        )
        expect(await aniv721.getApproved(id1)).to.equal(B.address)
    })

    it("correctly cancels approval", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        await aniv721.connect(A).approve(B.address, id1)
        await aniv721.connect(A).approve(zeroAddress, id1)
        expect(await aniv721.getApproved(id1)).to.equal(zeroAddress)
    })

    it("throws when trying to get approval of non-existing NFT id", async function () {
        await expect(aniv721.getApproved(id1)).to.be.reverted
    })

    it("throws when trying to approve NFT ID from a third party", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        await expect(aniv721.connect(B).approve(B.address, id1)).to.be.reverted
    })

    it("correctly transfers NFT from owner", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        expect(
            await aniv721.connect(A).transferFrom(A.address, B.address, id1)
        ).to.emit(aniv721, "Transfer")
        expect(await aniv721.balanceOf(A.address)).to.equal(0)
        expect(await aniv721.balanceOf(B.address)).to.equal(1)
        expect(await aniv721.ownerOf(id1)).to.equal(B.address)
    })

    it("throws when trying to transfer NFT as an address that is not owner, approved or operator", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        await expect(aniv721.connect(B).transferFrom(A.address, C.address, id1))
            .to.be.reverted
    })

    it("throws when trying to transfer NFT to a zero address", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        await expect(
            aniv721.connect(A).transferFrom(A.address, zeroAddress, id1)
        ).to.be.reverted
    })

    it("throws when trying to transfer an invalid NFT", async function () {
        await expect(aniv721.connect(A).transferFrom(A.address, B.address, id1))
            .to.be.reverted
    })

    it("throws when trying to transfer an invalid NFT", async function () {
        await expect(aniv721.connect(A).transferFrom(A.address, B.address, id1))
            .to.be.reverted
    })

    it("correctly sets an operator", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        expect(
            await aniv721.connect(A).setApprovalForAll(B.address, true)
        ).to.emit(aniv721, "ApprovalForAll")
        expect(await aniv721.isApprovedForAll(A.address, B.address)).to.equal(
            true
        )
    })

    it("correctly sets then cancels an operator", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        await aniv721.connect(A).setApprovalForAll(B.address, true)
        await aniv721.connect(A).setApprovalForAll(B.address, false)
        expect(await aniv721.isApprovedForAll(A.address, B.address)).to.equal(
            false
        )
    })

    it("correctly transfers NFT from approved address", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        await aniv721.connect(A).approve(B.address, id1)
        await aniv721.connect(B).transferFrom(A.address, C.address, id1)
        expect(await aniv721.balanceOf(A.address)).to.equal(0)
        expect(await aniv721.balanceOf(C.address)).to.equal(1)
        expect(await aniv721.ownerOf(id1)).to.equal(C.address)
    })

    it("correctly transfers NFT as operator", async function () {
        await aniv721.connect(owner).mint(A.address, id1)
        await aniv721.connect(A).setApprovalForAll(B.address, true)
        await aniv721.connect(B).transferFrom(A.address, C.address, id1)
        expect(await aniv721.balanceOf(A.address)).to.equal(0)
        expect(await aniv721.balanceOf(C.address)).to.equal(1)
        expect(await aniv721.ownerOf(id1)).to.equal(C.address)
    })

    // Operator

    it("correctly opensea transfers NFT as operator", async function () {
        await aniv721.connect(owner).mint(B.address, id1)
        await proxy.connect(owner).setProxy(B.address, A.address)
        await aniv721.connect(A).transferFrom(B.address, C.address, id1)
        expect(await aniv721.balanceOf(B.address)).to.equal(0)
        expect(await aniv721.balanceOf(C.address)).to.equal(1)
        expect(await aniv721.ownerOf(id1)).to.equal(C.address)
    })

    it("correctly return uri", async function () {
        await aniv721.connect(owner).mint(owner.address, id1)
        expect(await aniv721.connect(owner).tokenURI(id1)).to.be.equal(
            `${baseURI}${id1}`
        )
    })

    it("correctly return totalSupply", async function () {
        for (var i = 1; i <= 10; i++) {
            await aniv721.connect(owner).mint(owner.address, i)
        }
        expect(await aniv721.connect(owner).totalSupply()).to.be.equal(10)
    })

    it("throw when owner approve to non-operator", async function () {
        await expect(aniv721.connect(owner).approve(A.address, id1)).to.be
            .reverted
    })

    it("throw when duplicate operator", async function () {
        await aniv721.connect(owner).mint(owner.address, id1)
        await aniv721.connect(owner).addOperator(A.address)
        expect(await aniv721.connect(owner).isOperator(A.address)).to.equal(
            true
        )
        await expect(aniv721.connect(owner).addOperator(A.address)).to.be
            .reverted
    })

    it("correctly transfer owner's NFT by operator", async function () {
        await aniv721.connect(owner).mint(owner.address, id1)
        await aniv721.connect(owner).addOperator(A.address)
        expect(await aniv721.connect(owner).isOperator(A.address)).to.equal(
            true
        )
        await aniv721.connect(owner).approve(A.address, id1)
        expect(await aniv721.connect(A).getApproved(id1)).to.equal(A.address)
        await aniv721.connect(A).transferFrom(owner.address, C.address, id1)
        expect(await aniv721.balanceOf(owner.address)).to.equal(0)
        expect(await aniv721.balanceOf(C.address)).to.equal(1)
        expect(await aniv721.ownerOf(id1)).to.equal(C.address)
    })

    it("throw when not owner call operator function", async function () {
        await expect(aniv721.connect(B).addOperator(A.address)).to.be.reverted
        expect(await aniv721.connect(B).isOperator(A.address)).to.equal(false)
        await aniv721.connect(owner).addOperator(A.address)
        expect(await aniv721.connect(owner).isOperator(A.address)).to.equal(
            true
        )
        await expect(aniv721.connect(B).revokeOperator(A.address)).to.be
            .reverted
        expect(await aniv721.connect(B).isOperator(A.address)).to.equal(true)
    })

    it("correctly revoke operator", async function () {
        for (var i = 1; i <= 10; i++) {
            await aniv721.connect(owner).mint(owner.address, i)
        }
        //add operator
        await aniv721.connect(owner).addOperator(A.address)
        expect(await aniv721.connect(owner).isOperator(A.address)).to.equal(
            true
        )
        await aniv721.connect(owner).addOperator(B.address)
        expect(await aniv721.connect(owner).isOperator(B.address)).to.equal(
            true
        )

        //approve
        for (var i = 1; i <= 5; i++) {
            await aniv721.connect(owner).approve(A.address, i)
            expect(await aniv721.connect(A).getApproved(i)).to.equal(A.address)
        }
        for (var i = 6; i <= 10; i++) {
            await aniv721.connect(owner).approve(B.address, i)
            expect(await aniv721.connect(A).getApproved(i)).to.equal(B.address)
        }

        //revoke
        await aniv721.connect(owner).revokeOperator(A.address)
        expect(await aniv721.connect(owner).isOperator(A.address)).to.equal(
            false
        )
        expect(await aniv721.connect(owner).isOperator(B.address)).to.equal(
            true
        )

        for (var i = 1; i <= 5; i++) {
            expect(await aniv721.connect(A).getApproved(i)).to.be.equal(
                zeroAddress
            )
        }
        for (var i = 6; i <= 10; i++) {
            await aniv721.connect(owner).approve(B.address, i)
            expect(await aniv721.connect(A).getApproved(i)).to.equal(B.address)
        }
    })

    it("operator can not transfer NFT to their own account", async function () {
        await aniv721.connect(owner).mint(owner.address, id1)
        await aniv721.connect(owner).addOperator(A.address)
        expect(await aniv721.connect(owner).isOperator(A.address)).to.equal(
            true
        )
        await expect(
            aniv721.connect(A).transferFrom(owner.address, A.address, id1)
        ).to.be.reverted
    })
})
