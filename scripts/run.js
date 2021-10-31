

const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory("MyEpicGame");
    const gameContract = await gameContractFactory.deploy(
        ["Faker", "Uzi", "Meteos", "Froggen"], //Names
        ["https://i.imgur.com/a/ih2NNgw", "https://i.imgur.com/a/pmKpeXC", "https://i.imgur.com/a/B0bGQmP", "https://i.imgur.com/a/ArFjzrt"], //images
        [1000, 900, 800, 700], //hp
        [1000, 1200, 800, 1000], //attackDamage
        [1, 1, 1, 1], //level
        [1000, 1100, 900, 1000], //defense  
        "Tyler1", //Boss Name
        "https://i.imgur.com/qzxMd1C.png", //imageURI
        20000, //Boss HP
        500, //Boss Attack Damage
        1000 //Boss Max Attack Damage
    );
    await gameContract.deployed();
    console.log("Contract deployed to:", gameContract.address);
    let txn;
    txn = await gameContract.mintCharacterNFT(3);
    await txn.wait();

    txn = await gameContract.attackBoss();
    await txn.wait();

    txn = await gameContract.attackBoss();
    await txn.wait();

    txn = await gameContract.playerRecover();
    await txn.wait();
};
const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
runMain();