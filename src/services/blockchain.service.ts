import { Location, SmartContract } from "@prisma/client";
import { create } from "ipfs-http-client";
import { Contract, ethers } from "ethers";
import FactoryContractAbi, {
  FactoryContractAddress,
} from "./../abis/FactoryContrac";
import TicketNftAbi from "./../abis/TicketNftABI";
import prisma from "../dbClient";
import { ApiError } from "../utils";
import httpStatus from "http-status";
import { createCanvas, loadImage, registerFont } from "canvas";
import Web3 from "web3";
import { Alchemy } from "alchemy-sdk";
import axios from "axios";

// Infura credentials
const projectId = "2J8ZK6Xi0RsGXdagpUTp72KizhP";
const projectSecret = "a423342ad44c853d04731200832aa0b7";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
// Wallet infooo
const PRIVATE_KEY_FOR_WALLET =
  "1b0dba0820797c1187850d3defc0546048b8b4b1c85203bbf34e24b447414328";
const PublicKey = "0x827f629C4b70D99c2564F499bB6B0b7D554b3b7B";
const rpcUrl = "https://rpc-mumbai.maticvigil.com";
// ipfs node url
const ipfsBaseUrl = "https://ipfs.io/ipfs/";

const createMetamaskWallet = async () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
};

const CreateNewNftContract = async (name: string, ticketCount: number) => {
  console.log("create nft");

  const contractName = "SolyTicket - " + name;
  const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(PRIVATE_KEY_FOR_WALLET, customHttpProvider);
  console.log(wallet);
  const contractWithSigner = new Contract(
    FactoryContractAddress,
    FactoryContractAbi,
    wallet,
  );
  console.log("contractWithSigner " + contractWithSigner);
  const _res = await contractWithSigner.createTicket(
    true,
    ticketCount,
    ticketCount,
    1,
    contractName,
    "soly",
    { from: PublicKey },
  );
  console.log("_res " + _res);
  const _details = await _res.wait();
  console.log("_details " + _details);
  let _contractAddress;
  _details.events.filter((event: { event: string; args: [any, any] }) => {
    if (event.event === "SolyContractDeployed") {
      const [by, contractAddress] = event.args;
      _contractAddress = contractAddress;
    }
  });
  console.log("nft contract", _contractAddress);

  return _contractAddress;
};

export default {
  createMetamaskWallet,
  CreateNewNftContract,
};
