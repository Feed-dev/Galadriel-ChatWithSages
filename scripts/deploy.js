const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const oracleAddress = "0x68EC9556830AD097D661Df2557FBCeC166a0A075";
  const knowledgeBaseCID = "QmTryE84tBdJMLC561d9aTrmjFkYsYFxr3aMadvKGoY9Pq";

  const ChatGpt = await hre.ethers.getContractFactory("ChatGpt");
  const chatGpt = await ChatGpt.deploy(oracleAddress, knowledgeBaseCID);

  await chatGpt.waitForDeployment();

  console.log("ChatGpt deployed to:", await chatGpt.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
