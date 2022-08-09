import { expect } from "chai";
import { ethers } from "hardhat";

describe("ANIV721 Test", function() {
  let aniv721: any, owner: any, A: any, B: any, C: any;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  const id1 = 9001;
  const id2 = 9002;

  beforeEach(async () => {
    [owner, A, B, C] = await ethers.getSigners();
    const ANIV721Land = await ethers.getContractFactory("ANIV721Land");
    aniv721 = await ANIV721Land.deploy(owner.address);
    await aniv721.deployed();
  });

  it("correctly mints a NFT", async function() {
    expect(await aniv721.connect(owner).mint(A.address, 1)).to.emit(aniv721, "Transfer");
    expect(await aniv721.balanceOf(A.address)).to.equal(1);
  });

  it("returns correct balanceOf", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    expect(await aniv721.balanceOf(A.address)).to.equal(1);
    await aniv721.connect(owner).mint(A.address, id2);
    expect(await aniv721.balanceOf(A.address)).to.equal(2);
  });

  it("throws when trying to get count of NFTs owned by 0x0 address", async function() {
    await expect(aniv721.balanceOf(zeroAddress)).to.be.reverted;
  });

  it("throws when trying to mint 2 NFTs with the same ids", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    await expect(aniv721.connect(owner).mint(A.address, id1)).to.be.reverted;
  });

  it("throws when trying to mint NFT to 0x0 address", async function() {
    await expect(aniv721.connect(owner).mint(zeroAddress, id1)).to.be.reverted;
  });

  it("finds the correct owner of NFToken id", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    expect(await aniv721.ownerOf(id1)).to.equal(A.address);
  });

  it("throws when trying to find owner od non-existing NFT id", async function() {
    await expect(aniv721.ownerOf(id1)).to.be.reverted;
  });

  it("correctly approves account", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    expect(await aniv721.connect(A).approve(B.address, id1)).to.emit(aniv721, "Approval");
    expect(await aniv721.getApproved(id1)).to.equal(B.address);
  });

  it("correctly cancels approval", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    await aniv721.connect(A).approve(B.address, id1);
    await aniv721.connect(A).approve(zeroAddress, id1);
    expect(await aniv721.getApproved(id1)).to.equal(zeroAddress);
  });

  it("throws when trying to get approval of non-existing NFT id", async function() {
    await expect(aniv721.getApproved(id1)).to.be.reverted;
  });

  it("throws when trying to approve NFT ID from a third party", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    await expect(aniv721.connect(B).approve(B.address, id1)).to.be.reverted;
  });

  it("correctly transfers NFT from owner", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    expect(await aniv721.connect(A).transferFrom(A.address, B.address, id1)).to.emit(aniv721, "Transfer");
    expect(await aniv721.balanceOf(A.address)).to.equal(0);
    expect(await aniv721.balanceOf(B.address)).to.equal(1);
    expect(await aniv721.ownerOf(id1)).to.equal(B.address);
  });

  it("throws when trying to transfer NFT as an address that is not owner, approved or operator", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    await expect(aniv721.connect(B).transferFrom(A.address, C.address, id1)).to.be.reverted;
  });

  it("throws when trying to transfer NFT to a zero address", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    await expect(aniv721.connect(A).transferFrom(A.address, zeroAddress, id1)).to.be.reverted;
  });

  it("throws when trying to transfer an invalid NFT", async function() {
    await expect(aniv721.connect(A).transferFrom(A.address, B.address, id1)).to.be.reverted;
  });

  it("throws when trying to transfer an invalid NFT", async function() {
    await expect(aniv721.connect(A).transferFrom(A.address, B.address, id1)).to.be.reverted;
  });

  it("correctly sets an operator", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    expect(await aniv721.connect(A).setApprovalForAll(B.address, true)).to.emit(aniv721, "ApprovalForAll");
    expect(await aniv721.isApprovedForAll(A.address, B.address)).to.equal(true);
  });

  it("correctly sets then cancels an operator", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    await aniv721.connect(A).setApprovalForAll(B.address, true);
    await aniv721.connect(A).setApprovalForAll(B.address, false);
    expect(await aniv721.isApprovedForAll(A.address, B.address)).to.equal(false);
  });

  it("correctly transfers NFT from approved address", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    await aniv721.connect(A).approve(B.address, id1);
    await aniv721.connect(B).transferFrom(A.address, C.address, id1);
    expect(await aniv721.balanceOf(A.address)).to.equal(0);
    expect(await aniv721.balanceOf(C.address)).to.equal(1);
    expect(await aniv721.ownerOf(id1)).to.equal(C.address);
  });

  it("correctly transfers NFT as operator", async function() {
    await aniv721.connect(owner).mint(A.address, id1);
    await aniv721.connect(A).setApprovalForAll(B.address, true);
    await aniv721.connect(B).transferFrom(A.address, C.address, id1);
    expect(await aniv721.balanceOf(A.address)).to.equal(0);
    expect(await aniv721.balanceOf(C.address)).to.equal(1);
    expect(await aniv721.ownerOf(id1)).to.equal(C.address);
  });

});
