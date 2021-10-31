const main = async () => {
    const gameContractFactory = await hre.ethers.getContractFactory("MyEpicGame");
    const gameContract = await gameContractFactory.deploy(
        ["Faker", "Uzi", "Meteos", "Froggen"], //Names
        ["https://i.imgur.com/L5msK8F.jpg", "https://i.imgur.com/9M8fI1f.jpg", "https://i.imgur.com/HwIknEt.jpg", "https://i.imgur.com/VQP8b2W.jpg"], //images
        [1000, 900, 800, 700], //hp
        [1000, 1200, 800, 1000], //attackDamage

        [1000, 1100, 900, 1000], //defense

        "Tyler1", //Boss Name
        "https://i.imgur.com/qzxMd1C.png", //imageURI
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