const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory("MyEpicGame");
    const gameContract = await gameContractFactory.deploy(
        ["Faker", "Uzi", "Meteos", "Froggen"], //Names
        ["QmYhKi3gshrWf9TsBbHPWBDhyf43fibgWHXHhLunbCExk6", "QmREq6atYR9Uh3x56LsFZt2Dj6Jz1AnF5eLX15znv5dTk1", "QmPSj9Ajq6urbmqfKi6fzWxVvAeE2aTBAWo29v2XvcZsF2", "QmQBfW5DRXYysUCu972f9BdbFazwYxpKrWuy9tHu9Juqkk"], //images
        [1000, 900, 800, 700], //hp
        [1000, 1200, 800, 1000], //attackDamage

        [1000, 1100, 900, 1000], //defense

        "Tyler1", //Boss Name
        "QmVtWAgBM87DGShJ5JvTYKjqRMWx3vz8Mz8NMoefphiejM", //imageURI
        20000, //Boss HP
        300, //Boss Attack Damage
        1700 //Boss Max Attack Damage
    );
    await gameContract.deployed();
    console.log("Contract deployed to:", gameContract.address);
    let funded = await hre.fundLink(hre, gameContract.address);
    console.log("Contract funded!");


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