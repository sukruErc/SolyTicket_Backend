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
  "529de337c18ba2aaf9dcea5e86ca123030eb282afaae940eea3e037f43bdb8ba";
const PublicKey = "0x0847db9D32932177974c175A64ce60095d9D7151";
const rpcUrl = "https://polygon-zkevm-cardona.blockpi.network/v1/rpc/public";
// ipfs node url
const ipfsBaseUrl = "https://ipfs.io/ipfs/";

const ipfsClient = () => {
  const ipfs = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  return ipfs;
};

const createMetamaskWallet = async () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
};

const CreateNewNftContract = async (name: string, ticketCount: number) => {
  const contractName = "SolyTicket - " + name;
  const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(PRIVATE_KEY_FOR_WALLET, customHttpProvider);
  const contractWithSigner = new Contract(
    FactoryContractAddress,
    FactoryContractAbi,
    wallet,
  );
  const _res = await contractWithSigner.createTicket(
    ticketCount,
    1,
    contractName,
    "soly",
    { from: PublicKey },
  );

  const _details = await _res.wait();
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

async function generateTicketNFT(
  image: string,
  displayName: string,
  desc: string,
  tokenId: number,
  address: string,
): Promise<boolean> {
  try {
    console.log(tokenId);
    // const imageString = await imageWithLabelConverter(displayName);
    const ipfsConverted = await loadIpfs(
      new Buffer(image.split(",")[1], "base64"),
    );
    const res = await constructMetadata(
      ipfsConverted,
      displayName,
      desc,
      tokenId,
      address,
    );

    if (res) {
      return true;
    }

    throw new ApiError(httpStatus.BAD_REQUEST, "İşlem Başarısız");
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error as any);
  }
}

export const loadIpfs = async (image: Buffer) => {
  const ipfs = ipfsClient();
  const result = await ipfs.add(image);
  return result.path;
};

const constructMetadata = async (
  imagePath: string,
  name: string,
  description: string,
  index: number,
  contractAddress: string,
) => {
  const ipfs = ipfsClient();
  const nftIds: Array<number> = [];
  const metadataCIDs = [];

  const metaDataObj = {
    name: name + " #" + index,
    description: description,
    image: ipfsBaseUrl + imagePath,
  };

  const result = await ipfs.add(JSON.stringify(metaDataObj));
  // becuase nft starts with id 0
  nftIds.push(index);
  metadataCIDs.push(result.path);

  await linkMetaData(nftIds, metadataCIDs, contractAddress);
  return true;
};

const linkMetaData = async (
  nftIds: Array<number>,
  CIDs: any[],
  nftContractAddress: string,
) => {
  if (nftIds.length !== CIDs.length) {
    return;
  }

  try {
    const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(
      PRIVATE_KEY_FOR_WALLET,
      customHttpProvider,
    );
    const nftContract = new Contract(nftContractAddress, TicketNftAbi, wallet);
    const _res = await nftContract.addTokenUriForNft(nftIds, CIDs, {
      from: PublicKey,
    });

    await _res.wait();

    // TEST
    // these part will be deleted later
    const _mint0 = await nftContract.mint({ from: PublicKey, value: 1 });
    await _mint0.wait();
  } catch (error: any) {
    console.log("====================================");
    console.log(error.message);
    console.log("====================================");
    throw new ApiError(httpStatus.BAD_REQUEST, "Something wrong in link");
  }
};

export default {
  createMetamaskWallet,
  CreateNewNftContract,
  generateTicketNFT,
};
