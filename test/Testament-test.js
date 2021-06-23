const { expect } = require('chai');

describe('Testament', function () {
  let Testament, testament, dev, owner, doctor, doctor2, alice, bob;

  beforeEach(async function () {
    [dev, owner, doctor, doctor2, alice, bob] = await ethers.getSigners();
    Testament = await ethers.getContractFactory('Testament');
    testament = await Testament.connect(dev).deploy(owner.address, doctor.address);
    await testament.deployed();
  });

  describe('Deployment', function () {
    it('Should revert if owner = doctor', async function () {
      await expect(Testament.connect(dev).deploy(owner.address, owner.address)).to.be.revertedWith(
        'Testament: doctor must be different than owner'
      );
    });
    it(`Should have owner set`, async function () {
      expect(await testament.owner()).to.equal(owner.address);
    });
    it(`Should have doctor set`, async function () {
      expect(await testament.doctor()).to.equal(doctor.address);
    });
    it('Emits DoctorSet event', async function () {
      await expect(testament.deployTransaction).to.emit(testament, 'DoctorSet').withArgs(dev.address, doctor.address);
    });
  });

  describe('setDoctor', function () {
    it(`Should revert if not owner`, async function () {
      await expect(testament.connect(dev).setDoctor(doctor2.address)).to.be.revertedWith(
        'Testament : only Owner can use this function'
      );
    });
    it(`Should revert if sender = doctor`, async function () {
      await expect(testament.connect(owner).setDoctor(owner.address)).to.be.revertedWith('You cannot be your Doctor');
    });
    it(`Should have doctor set`, async function () {
      await testament.connect(owner).setDoctor(doctor2.address);
      expect(await testament.doctor()).to.equal(doctor2.address);
    });
    it('Emits DoctorSet event', async function () {
      await expect(testament.connect(owner).setDoctor(doctor2.address))
        .to.emit(testament, 'DoctorSet')
        .withArgs(owner.address, doctor2.address);
    });
  });

  describe('endContract', function () {
    it(`Should revert if not doctor`, async function () {
      await expect(testament.connect(dev).endContract()).to.be.revertedWith(
        'Testament : only Doctor can use this function'
      );
    });
    it(`Should revert if contract already ended`, async function () {
      await testament.connect(doctor).endContract();
      await expect(testament.connect(doctor).endContract()).to.be.revertedWith('Testament : Contract is already ended');
    });
    it(`Should have endContract set`, async function () {
      await testament.connect(doctor).endContract();
      expect(await testament.isContractOver()).to.equal(true);
    });
    it('Emits ContractEnded event', async function () {
      await expect(testament.connect(doctor).endContract())
        .to.emit(testament, 'ContractEnded')
        .withArgs(doctor.address);
    });
  });

  describe('bequeath', function () {
    it(`Should revert if not owner`, async function () {
      await expect(testament.connect(dev).bequeath(alice.address, { value: 10, gasPrice: 0 })).to.be.revertedWith(
        'Testament : only Owner can use this function'
      );
    });
    it(`Should have legacy set`, async function () {
      await testament.connect(owner).bequeath(alice.address, { value: 10, gasPrice: 0 });
      expect(await testament.legacyOf(alice.address)).to.equal(10);
    });
    it('Should change ether balances', async function () {
      const tx = await testament.connect(owner).bequeath(alice.address, { value: 10, gasPrice: 0 });
      expect(tx).to.changeEtherBalance(owner, -10);
    });
    it('Emits Bequeathed event', async function () {
      await expect(testament.connect(owner).bequeath(alice.address, { value: 10, gasPrice: 0 }))
        .to.emit(testament, 'Bequeathed')
        .withArgs(owner.address, alice.address, 10);
    });
  });

  describe('withdrawLegacy', function () {
    beforeEach(async function () {
      await testament.connect(owner).bequeath(alice.address, { value: 10, gasPrice: 0 });
    });

    it(`Should revert if contract not ended`, async function () {
      await expect(testament.connect(alice).withdrawLegacy()).to.be.revertedWith('Testament : Owner is still alive');
    });
    it(`Should revert if legacy = 0`, async function () {
      await testament.connect(doctor).endContract();
      await expect(testament.connect(bob).withdrawLegacy()).to.be.revertedWith('Testament : nothing to withdraw');
    });
    it(`Should have legacy set to 0`, async function () {
      await testament.connect(doctor).endContract();
      await testament.connect(alice).withdrawLegacy();
      expect(await testament.legacyOf(alice.address)).to.equal(0);
    });
    it('Should set balance recipient', async function () {
      await testament.connect(doctor).endContract();
      const tx = await testament.connect(alice).withdrawLegacy();
      expect(tx).to.changeEtherBalance(alice, 10);
    });
    it('Emits Withdrawed event', async function () {
      await testament.connect(doctor).endContract();
      await expect(testament.connect(alice).withdrawLegacy())
        .to.emit(testament, 'Withdrawed')
        .withArgs(alice.address, 10);
    });
  });
});
