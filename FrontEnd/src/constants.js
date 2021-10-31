const CONTRACT_ADDRESS ="0xd64586eB9Fb38DC75aE6c7011E7c94401Ecf68D6";
const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    maxAttackDamage: characterData.maxAttackDamage.toNumber(),
    defense: characterData.defense.toNumber(),
    maxDefense: characterData.maxDefense.toNumber(),
  };
};
const transformBossData = (bossData) => {
  return {
    name: bossData.name,
    imageURI: bossData.imageURI,
    hp: bossData.hp.toNumber(),
    maxHp: bossData.maxHp.toNumber(),
    attackDamage: bossData.attackDamage.toNumber(),
    maxAttackDamage: bossData.maxAttackDamage.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformCharacterData, transformBossData };