import dotenv from "dotenv";
import { ethers } from "ethers";
import {
  MAINNET_URL,
  POLYMARKET_MAINNET_URL,
  MATIC_URLS,
  POLYMARKET_MAINNET_ADDRES,
  POLYMARKET_MATIC_URL,
} from "./constants";
import { getBlockSigilData } from "./helpers/blockvigil";
import {
  getRecipientBalance,
  getRelayerBalance,
  getRelayerData,
} from "./helpers/ethers";
dotenv.config();

const main = async (): Promise<void> => {
  const mainnetProvider = new ethers.providers.JsonRpcProvider(MAINNET_URL);
  const maticProvider = new ethers.providers.JsonRpcProvider(
    POLYMARKET_MATIC_URL
  );

  const mainnetRecipientBalance = await getRecipientBalance(mainnetProvider);

  const gsnBalance = await getRelayerBalance(
    mainnetProvider,
    POLYMARKET_MAINNET_ADDRES
  );
  const relayer = await getRelayerData(POLYMARKET_MAINNET_URL);

  const mainnetData = {
    recipientBalance: mainnetRecipientBalance,
    address: MAINNET_URL,
    relayers: [
      {
        balance: gsnBalance,
        isReady: relayer.isReady,
        address: POLYMARKET_MAINNET_ADDRES,
      },
    ],
  };

  const relayers = [];
  const maticRecipientBalance = await getRecipientBalance(maticProvider);

  const maticData: any = {
    recipientBalance: maticRecipientBalance,
    address: POLYMARKET_MATIC_URL,
    relayers: [],
  };

  for (let url of MATIC_URLS) {
    const relayer = await getRelayerData(url);
    relayers.push(relayer);
  }

  for (let i = 0; i < relayers.length; i++) {
    const gsnBalance = await getRelayerBalance(
      maticProvider,
      relayers[i].address
    );

    const relayerData: any = {
      balance: gsnBalance,
      isReady: relayers[i].isReady,
      address: relayers[i].address,
    };

    maticData.relayers.push(relayerData);
  }

  const blockSigilData = await getBlockSigilData();

  // output
  const data = {
    mainnet: mainnetData,
    matic: maticData,
    blockSigil: blockSigilData,
  };
  console.log(data.mainnet);
  console.log(data.matic);
  console.log(data.blockSigil);
};

main();

setInterval(main, 10 * 60 * 1000); //every 10 mins
