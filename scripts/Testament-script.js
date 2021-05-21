const hre = require("hardhat");

async function main() {

  const Testament = await hre.ethers.getContractFactory("Testament");
  const testament = await Testament.deploy();

  await testament.deployed();

  console.log("Testament deployed to:", testament.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
