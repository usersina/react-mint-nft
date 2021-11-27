import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { useEffect, useState } from 'react';

import { ethers } from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'usersina_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  'https://testnets.opensea.io/collection/squarenft-dhgszgfwcl';

const CONTRACT_ADDRESS = '0x58236dE08AE74D8C3feeEAD1f3f1cE6132bB6d34';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');

  const [maxMints, setMaxMints] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);

  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return alert('Metamask is not installed!');
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log('Connected to chain ' + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = '0x4';
      if (chainId !== rinkebyChainId) {
        return alert('You are not connected to the Rinkeby Test Network!');
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected', accounts[0]);

      // This is executed when a user connects their wallet for the first time
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        return console.log('Setup event listener!');
      }
      console.log("Ethereum object doesn't exist!");
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    setLoading(true);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log('Pay gas fees from wallet...');
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log('Mining, please wait...');
        await nftTxn.wait();

        setTotalMinted(totalMinted + 1);
        setLoading(false);

        return console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      }
      console.log('Ethereum object does not exist!');
    } catch (error) {
      console.log(error);
      alert('Could not mint!');
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAccountAndGetMintedCount = async () => {
      const { ethereum } = window;

      if (!ethereum) {
        return console.log('Make sure you have metamask!');
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );

      const max = await connectedContract.getMaxMints();
      const total = await connectedContract.getTotalMinted();
      setMaxMints(
        Math.round(parseFloat(ethers.utils.formatEther(max)) * 10 ** 18)
      );
      setTotalMinted(
        Math.round(parseFloat(ethers.utils.formatEther(total)) * 10 ** 18)
      );

      // -- Check if access to the user's wallet is allowed
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);

        // This is executed when a user already has their wallet connected and authorized
        setupEventListener();
      } else {
        console.log('No authorized account found');
      }
    };
    checkAccountAndGetMintedCount();
  }, []);

  return (
    <main className="App">
      <div className="container">
        <header className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          <p className="sub-text mint-count">
            Minted so far:{' '}
            <strong>
              {totalMinted} / {maxMints}
            </strong>
          </p>
          {loading ? (
            <button className="cta-button connect-wallet-button">
              Minting your NFT ...
            </button>
          ) : currentAccount === '' ? (
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWallet}
            >
              Connect to Wallet
            </button>
          ) : (
            <button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
            >
              Mint NFT
            </button>
          )}
        </header>
        <button
          className="cta-button opensea-button"
          style={{ maxWidth: '600px', marginRight: 'auto', marginLeft: 'auto' }}
          onClick={() => window.open(OPENSEA_LINK)}
        >
          View Collection on OpenSea
        </button>
        <footer className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </footer>
      </div>
    </main>
  );
};

export default App;
