import Arena from "./Components/Arena";
import React, { useEffect, useState } from 'react';
import './App.css';
import SelectCharacter from "./Components/SelectCharacter";
import {CONTRACT_ADDRESS, transformCharacterData, transformBossData} from './constants';
import myEpicGame from "./utils/MyEpicGame.json";
import LoadingIndicator from "./Components/LoadingIndicator";
import {ethers} from 'ethers';
// Constants
const GITHUB_HANDLE = 'technovision99';
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}`;

const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const renderContent = () => {
    if(isLoading) {
      return <LoadingIndicator />;
    }
    
    if (!currentAccount) {
      return (
      <div className="connect-wallet-container">
        <img
          src="https://c.tenor.com/BLMDn1-WnNEAAAAC/tyler1-tyler1meltdown.gif"
          alt="T1 Rage Gif"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
      </div>
    );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
    return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />; // Hey bud! Gotta run for a little bit but you need to pass
    // the "setCharacterNFT" prop here, as you're calling it inside the "Arena" file:
    // <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />; 
    // Good luck! 
  }
      
  }

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
    
  }, []);
useEffect(() => {
  /*
   * The function we will call that interacts with out smart contract
   */
  const fetchNFTMetadata = async () => {
    console.log('Checking for Character NFT on address:', currentAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer
    );

    const txn = await gameContract.checkIfUserHasNFT();
    if (txn.name) {
      console.log('User has character NFT');
      setCharacterNFT(transformCharacterData(txn));
    } else {
      console.log("No Character Found!");
    }
    setIsLoading(false);
  };


  /*
   * We only want to run this, if we have a connected wallet
   */
  if (currentAccount) {
    console.log('CurrentAccount:', currentAccount);
    fetchNFTMetadata();
  }
}, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Riot Balance Team SUX! ⚔️</p>
          <p className="sub-text">Can you beat the poster child of Riot Games?</p>
          
          {renderContent()}
         
        </div>
        <div className="footer-container">
         
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Github: @${GITHUB_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;