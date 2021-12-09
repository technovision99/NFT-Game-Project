//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Libraries/Base64.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract MyEpicGame is ERC721, VRFConsumerBase {
    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public DiceRoll;
    uint256 public randomEffectNumber;
    // We'll hold our character's attributes in a struct. Feel free to add
    // whatever you'd like as an attribute! (ex. defense, crit chance, etc).
    struct CharacterAttributes {
        uint256 characterIndex;
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
        uint256 maxAttackDamage;
        uint256 defense;
        uint256 maxDefense;
    }
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;
    mapping(address => uint256) public nftHolders;
    event CharacterNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 characterIndex
    );
    event AttackComplete(
        uint256 newBossHp,
        uint256 newBossAttack,
        uint256 newPlayerHp,
        uint256 newPlayerAttack,
        uint256 newPlayerDefense
    );
    event PlayerRecovered(uint256 newPlayerAttack, uint256 newPlayerDefense);

    struct BigBoss {
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
        uint256 maxAttackDamage;
    }
    BigBoss public bigBoss;

    // A lil array to help us hold the default data for our characters.
    // This will be helpful when we mint new characters and need to know
    // things like their HP, AD, etc.
    CharacterAttributes[] defaultCharacters;

    // Data passed in to the contract when it's first created initializing the characters.
    // We're going to actually pass these values in from from run.js.
    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint256[] memory characterHp,
        uint256[] memory characterAttackDmg,
        uint256[] memory characterDefense,
        string memory bossName,
        string memory bossImageURI,
        uint256 bossHp,
        uint256 bossAttackDamage,
        uint256 bossMaxAttackDamage
    )
        ERC721("Legends", "LEGEND")
        VRFConsumerBase(
            0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B,
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709
        )
    {
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10**18;
        bigBoss = BigBoss({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDamage,
            maxAttackDamage: bossMaxAttackDamage
        });
        console.log(
            "Done initializing %s with HP %s, and attack %s",
            bigBoss.name,
            bigBoss.hp,
            bigBoss.attackDamage
        );
        console.log("Here is how he looks: %s", bigBoss.imageURI);
        // Loop through all the characters, and save their values in our contract so
        // we can use them later when we mint our NFTs.
        for (uint256 i = 0; i < characterNames.length; i += 1) {
            defaultCharacters.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    hp: characterHp[i],
                    maxHp: characterHp[i],
                    attackDamage: characterAttackDmg[i],
                    maxAttackDamage: characterAttackDmg[i],
                    defense: characterDefense[i],
                    maxDefense: characterDefense[i]
                })
            );

            CharacterAttributes memory c = defaultCharacters[i];
            console.log(
                "Done initializing %s w/ HP %s, maxHP %s",
                c.name,
                c.hp,
                c.maxHp
            );
            console.log(
                "And attack %s, defense %s, ",
                c.attackDamage,
                c.defense
            );
            console.log("With  img %s", c.imageURI);
        }
        _tokenIds.increment();
    }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        DiceRoll = (randomness % 6) + 1;
        randomEffectNumber =
            ((uint256(keccak256(abi.encode(randomness)))) % 491) +
            10;
    }

    function mintCharacterNFT(uint256 _characterIndex) external {
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        nftHolderAttributes[newItemId] = CharacterAttributes({
            characterIndex: _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            hp: defaultCharacters[_characterIndex].hp,
            maxHp: defaultCharacters[_characterIndex].hp,
            attackDamage: defaultCharacters[_characterIndex].attackDamage,
            maxAttackDamage: defaultCharacters[_characterIndex].attackDamage,
            defense: defaultCharacters[_characterIndex].defense,
            maxDefense: defaultCharacters[_characterIndex].defense
        });
        nftHolders[msg.sender] = newItemId;
        _tokenIds.increment();
        getRandomNumber();
        emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        CharacterAttributes memory charAttributes = nftHolderAttributes[
            _tokenId
        ];

        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(
            charAttributes.attackDamage
        );
        string memory strMaxAttackDamage = Strings.toString(
            charAttributes.maxAttackDamage
        );

        string memory strDefense = Strings.toString(charAttributes.defense);
        string memory strMaxDefense = Strings.toString(
            charAttributes.maxDefense
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        charAttributes.name,
                        " -- NFT #: ",
                        Strings.toString(_tokenId),
                        '", "description": "This is a cool NFT!", "image": "ipfs://',
                        charAttributes.imageURI,
                        '", "attributes": [ { "trait_type": "Health Points", "value": ',
                        strHp,
                        ', "max_value":',
                        strMaxHp,
                        '}, { "trait_type": "Attack Damage", "value": ',
                        strAttackDamage,
                        ',"max_value":',
                        strMaxAttackDamage,
                        '},  { "trait_type": "Defense", "value": ',
                        strDefense,
                        ',"max_value":',
                        strMaxDefense,
                        "}]}"
                    )
                )
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function checkIfUserHasNFT()
        public
        view
        returns (CharacterAttributes memory)
    {
        uint256 userNftTokenUserId = nftHolders[msg.sender];
        if (userNftTokenUserId > 0) {
            return nftHolderAttributes[userNftTokenUserId];
        } else {
            CharacterAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    function getAllDefaultCharacters()
        public
        view
        returns (CharacterAttributes[] memory)
    {
        return defaultCharacters;
    }

    function getBigBoss() public view returns (BigBoss memory) {
        return bigBoss;
    }

    function attackBoss() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];
        console.log(
            "\nPlayer w/ character %s about to attack. Has %s HP and %s AD",
            player.name,
            player.hp,
            player.attackDamage
        );
        console.log(
            "Boss %s has %s HP and %s AD",
            bigBoss.name,
            bigBoss.hp,
            bigBoss.attackDamage
        );

        require(player.hp > 0 && bigBoss.hp > 0 && player.attackDamage > 0);
        if (bigBoss.hp <= player.attackDamage) {
            bigBoss.hp = 0;
            console.log("Victory! %s has been defeated!", bigBoss.name);
        } else {
            bigBoss.hp -= player.attackDamage;

            bossAction();
        }
    }

    function playerRecover() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];
        uint256 randomAmount = ((
            uint256(keccak256(abi.encode(randomEffectNumber + block.timestamp)))
        ) % 491) + 10;

        console.log(
            "\nPlayer w/ character %s about to recover. Has %s AD and %s DEF ",
            player.name,
            player.attackDamage,
            player.defense
        );
        require(
            player.attackDamage < player.maxAttackDamage ||
                player.defense < player.maxDefense,
            "No need to recover! Fight!"
        );
        if (player.attackDamage + randomAmount > player.maxAttackDamage) {
            player.attackDamage = player.maxAttackDamage;
            console.log(
                "Player recovered and is back to %s ATK!",
                player.attackDamage
            );
        } else {
            player.attackDamage += randomAmount;
            console.log(
                "Player recovered and is back to %s ATK!",
                player.attackDamage
            );
        }
        if (player.defense + randomAmount > player.maxDefense) {
            player.defense = player.maxDefense;
            console.log(
                "Player recovered and is back to %s DEF!",
                player.defense
            );
        } else {
            player.defense += randomAmount;
            console.log(
                "Player recovered and is back to %s DEF!",
                player.defense
            );
        }
        emit PlayerRecovered(player.attackDamage, player.defense);
        bossAction();
    }

    function bossAction() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];
        uint256 randomDiceRoll = ((
            uint256(
                keccak256(
                    abi.encode(DiceRoll + block.difficulty + block.timestamp)
                )
            )
        ) % 6) + 1;

        uint256 randomAmount = ((
            uint256(keccak256(abi.encode(randomEffectNumber + block.timestamp)))
        ) % 491) + 10;
        console.log("Boss is about to take Action!");
        require(bigBoss.hp > 0);
        if (
            randomDiceRoll == 1 || (randomDiceRoll == 6 && player.defense > 0)
        ) {
            if (player.defense - randomAmount < 0) {
                player.defense = 0;
            } else {
                player.defense -= randomAmount;
            }
        } else if (
            randomDiceRoll == 2 ||
            (randomDiceRoll == 5 && player.attackDamage > 0)
        ) {
            if (player.attackDamage - randomAmount < 0) {
                player.attackDamage = 0;
            } else {
                player.attackDamage -= randomAmount;
            }
        } else if (randomDiceRoll == 3 && bigBoss.hp < bigBoss.maxHp) {
            if (bigBoss.hp + randomAmount > bigBoss.maxHp) {
                bigBoss.hp = bigBoss.maxHp;
            } else {
                bigBoss.hp += randomAmount;
            }
        } else if (
            randomDiceRoll == 4 &&
            bigBoss.attackDamage < bigBoss.maxAttackDamage
        ) {
            if (bigBoss.attackDamage + randomAmount > bigBoss.maxAttackDamage) {
                bigBoss.attackDamage = bigBoss.maxAttackDamage;
            } else {
                bigBoss.attackDamage += randomAmount;
            }
        }
        bossAttack();
    }

    function bossAttack() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];
        uint256 temp = 0;
        require(bigBoss.hp > 0);
        if (player.defense > 0) {
            if (player.defense - bigBoss.attackDamage < 0) {
                temp = bigBoss.attackDamage - player.defense;
                player.defense = 0;
                player.hp -= temp;
                console.log(
                    "Boss %s attacked! Now player defense is 0 and player HP is %s!",
                    bigBoss.name,
                    player.hp
                );
            } else {
                player.defense -= bigBoss.attackDamage;
                console.log(
                    "Boss %s attacked! Now player defense went down to %s!",
                    bigBoss.name,
                    player.defense
                );
            }
        } else if (player.hp <= bigBoss.attackDamage) {
            player.hp = 0;
            console.log("You lost. GG");
        } else {
            player.hp -= bigBoss.attackDamage;
            console.log(
                "Boss %s attacked and your HP went down %s!",
                bigBoss.name,
                player.hp
            );
        }
        emit AttackComplete(
            bigBoss.hp,
            bigBoss.attackDamage,
            player.hp,
            player.attackDamage,
            player.defense
        );
    }
}
