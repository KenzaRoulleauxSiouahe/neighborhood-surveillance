const Resident = require("../models/Resident");

// Randomly selects three residents and assigns them as cult members.
async function chooseCultMembers() {
	const residents = await Resident.find();

	// Reset all residents before choosing the new cult members.
	for (const resident of residents) {
		resident.isCultMember = false;
		await resident.save();
	}

	const cultSize = 3;

	// Create a shuffled copy so the original residents array is not modified.
	const shuffledResidents = residents.toSorted(() => Math.random() - 0.5);

	const cultMembers = shuffledResidents.slice(0, cultSize);

	// Assign the selected residents to the cult.
	for (const member of cultMembers) {
		member.isCultMember = true;
		await member.save();
	}

	return cultMembers;
}

module.exports = chooseCultMembers;
