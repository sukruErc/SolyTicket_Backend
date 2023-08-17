import { ethers } from "ethers";

const createMetamaskWallet = async () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
};

export default {
  createMetamaskWallet,
};
