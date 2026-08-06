const Resident = require("../models/Resident");

async function chooseCultMembers() {
	const residents = await Resident.find();

	for (const resident of residents) {
		resident.isCultMember = false;
		await resident.save();
	}

	const cultSize = 3;

	const shuffledResidents = residents.sort(() => Math.random() - 0.5);

	const cultMembers = shuffledResidents.slice(0, cultSize);

	for (const member of cultMembers) {
		member.isCultMember = true;
		await member.save();
	}

	return cultMembers;
}

module.exports = chooseCultMembers;
