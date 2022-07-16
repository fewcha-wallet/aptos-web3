import React from "react";
// import Web3Provider from "@fewcha/web3-react";
import Web3Provider from "components/Provider";
import Header from "components/Header/Header";
import { NFTs } from "components/NFT/NFT";
import Wallets from "components/Wallet/Wallets";

const App: React.FC = () => {
  return (
    <Web3Provider>
      <Header />
      {/* <NFTs /> */}
      <Wallets type="flex" />
    </Web3Provider>
  );
};

export default App;
