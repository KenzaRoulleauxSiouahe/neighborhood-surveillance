const roleRoutines = {
	"Police Officer": {
		workplace: "Police Station",
		outsideVillage: false,
		start: "06:30",
		end: "18:00",
		freeDays: ["Saturday", "Sunday"],
	},

	Doctor: {
		workplace: "Hospital",
		outsideVillage: true,
		start: "05:00",
		end: "19:00",
		freeDays: ["Wednesday", "Sunday"],
	},

	Forestkeeper: {
		workplace: "forest",
		outsideVillage: false,
		start: "05:00",
		end: "10:30",
		freeDays: ["Tuesday", "Saturday"],
	},

	Teacher: {
		workplace: "School",
		outsideVillage: false,
		start: "07:00",
		end: "18:00",
		freeDays: ["Saturday", "Sunday"],
	},

	Student: {
		workplace: "School",
		outsideVillage: false,
		start: "08:00",
		end: "17:00",
		freeDays: ["Saturday", "Sunday"],
	},

	Gravekeeper: {
		workplace: "Cemetery",
		outsideVillage: false,
		start: "00:00",
		end: "09:00",
		freeDays: ["Monday", "Thursday"],
	},

	Artist: {
		workplace: null,
		freeDays: [],
	},

	Retired: {
		workplace: null,
		freeDays: [],
	},

	"Shop owner": {
		workplace: "clothing store",
		outsideVillage: false,
		start: "09:00",
		end: "18:00",
		freeDays: ["Sunday", "Monday"],
	},

	Cashier: {
		workplace: "Supermarket",
		outsideVillage: false,
		start: "10:00",
		end: "20:00",
		freeDays: ["Tuesday", "Monday"],
	},
};

module.exports = roleRoutines;
