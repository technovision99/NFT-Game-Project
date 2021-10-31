import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData, transformBossData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from "../LoadingIndicator";
import vspic from '../../assets/vspicture.jpg';
/*
 * We pass in our characterNFT metadata so we can a cool card in our UI
 */
const Arena = ({ characterNFT, setCharacterNFT}) => {
  // State
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [recoverState, setRecoverState] = useState('');
  const [showToast, setShowToast] = useState(false);
  const runAttackAction = async () => {
    try {
      if(gameContract) {
        setAttackState("attacking");
        console.log("Preparing to attack...");
        const attackTxn = await gameContract.attackBoss({gasLimit:300000});
        await attackTxn.wait();
        console.log("attackTxn:", attackTxn);
        setAttackState("hit");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (error){
      console.error("Error Attacking Boss:", error);
      setAttackState('');
    }
  };
  const runPlayerRecover = async() => {
    try {
      if(gameContract) {
        setRecoverState("recovering");
        console.log("Preparing to recover");
        const recoverTxn = await gameContract.playerRecover({gasLimit:300000});
        await recoverTxn.wait();
        console.log("RecoverTxn:", recoverTxn);
        setRecoverState("recovered");
      }
    } catch (error){
      console.error("Error recovering:", error);
      setRecoverState("");
    }
  };
  // UseEffects
  useEffect(() => {
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            console.log('Boss:', bossTxn);
            setBoss(transformBossData(bossTxn));
        };

        /*
        * Setup logic when this event is fired off
        */
        const onAttackComplete = (newBossHp,
         newBossAttack,
        newPlayerHp,
         newPlayerAttack,
         newPlayerDefense) => {
            const bossHp = newBossHp;
            const bossAtk = newBossAttack;
            
            const playerHp = newPlayerHp;
            const playerAtk = newPlayerAttack;
            const playerDef = newPlayerDefense;
            console.log(`AttackComplete: Boss HP: ${bossHp}, Boss ATK: ${bossAtk}, Player HP: ${playerHp}, Player ATK: ${playerAtk}, Player DEF: ${playerDef}`);

            /*
            * Update both player and boss Hp
            */
            setBoss((prevState) => {
                return { ...prevState, hp: bossHp, attackDamage: bossAtk };
            });

            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp, attackDamage: playerAtk, defense: playerDef};
            });
        };

        const onPlayerRecovered = (newPlayerAttack,newPlayerDefense) => {
          const playerAtk = newPlayerAttack;
          const playerDef = newPlayerDefense;
          console.log('Player recover complete: Player ATK: ${playerAtk}, Player DEF: ${playerDef}');
          setCharacterNFT((prevState) => {
                return { ...prevState, attackDamage: playerAtk, defense: playerDef};
            });
        };

        if (gameContract) {
            fetchBoss();
            gameContract.on('AttackComplete', onAttackComplete);
            gameContract.on('PlayerRecovered', onPlayerRecovered);
        }

        /*
        * Make sure to clean up this event when this component is removed
        */
        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
                gameContract.off('PlayerRecovered', onPlayerRecovered);
            }
        }
    }, [gameContract]);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  return (
  <div className="arena-container">
  {boss && (
      <div id="toast" className="show">
        <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
      </div>
    )}
    {/* Boss */}
    {boss && (
      <div className="boss-container">
      
        <div className={`boss-content ${attackState}`}>
        <h2> Boss: </h2>
          <h2>{boss.name} </h2>
          <div className="image-content">
            <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
           
          </div>
           <div className="health-bar">
              <progress value={boss.hp} max={boss.maxHp} />
              <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
            </div>
            <div className="health-bar">
              <progress value={boss.attackDamage} max={boss.maxAttackDamage} />
              <p>{`${boss.attackDamage} / ${boss.maxAttackDamage} AD`}</p>
            </div>
            <div className="attack-container ">
          <button className="cta-button" onClick={runAttackAction}>
            {`💥 Attack ${boss.name}`}
          </button>
        </div>
        {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator />
          <p>Attacking ⚔️</p>
        </div>
      )}
    </div>
  )}
        </div>
        
         
     
      
    )}
    <div className = "vs-picture">
    <div className ="vs-container">
    🔥 <img className="picture-effects" src = {vspic} alt ="vs logo" />🔥
    </div>
    </div>
    
    {/* Replace your Character UI with this */}
    {characterNFT && (
      <div className="boss-container">
        <div className="boss-content ${recoverState}">
          <h2>Your Pro Player:</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.imageURI}
                alt={`Character ${characterNFT.name}`}
              />
              
            </div>
            <div className="health-bar">
                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
              </div>
              <div className="health-bar">
                <progress value={characterNFT.attackDamage} max={characterNFT.maxAttackDamage} />
                <p>{`${characterNFT.attackDamage} / ${characterNFT.maxAttackDamage} AD`}</p>
              </div>
              <div className="health-bar">
                <progress value={characterNFT.defense} max={characterNFT.maxDefense} />
                <p>{`${characterNFT.defense} / ${characterNFT.maxDefense} DEF`}</p>
              </div>
          </div>
          <div className="attack-container ">
          <button className="cta-button" onClick={runPlayerRecover}>
            {`💥 Recover Player AD, DEF`}
          </button>
        </div>
        {recoverState === 'recovering' && (
        <div className="loading-indicator">
          <LoadingIndicator />
          <p>Healing...</p>
        </div>
      )}
    </div>
  )}
        </div>
          
      
    )}
  </div>
);
};

export default Arena;