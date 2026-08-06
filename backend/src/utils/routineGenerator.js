const roleRoutines = {
	"Police Officer": {
		workplace: "Police Station",
		outsideVillage: false,
		start: "06:30",
		end: "18:00",
	},

	Doctor: {
		workplace: "Hospital",
		outsideVillage: true,
		start: "05:00",
		end: "19:00",
	},

	Forestkeeper: {
		workplace: "forest",
		outsideVillage: false,
		start: "05:00",
		end: "10:30",
	},

	Teacher: {
		workplace: "School",
		outsideVillage: false,
		start: "07:00",
		end: "18:00",
	},

	Student: {
		workplace: "School",
		outsideVillage: false,
		start: "08:00",
		end: "17:00",
	},

	Gravekeeper: {
		workplace: "Cemetery",
		outsideVillage: false,
		start: "00:00",
		end: "09:00",
	},

	Artist: {
		workplace: null,
	},

	Retired: {
		workplace: null,
	},

	"Shop owner": {
		workplace: "clothing store",
		outsideVillage: false,
		start: "09:00",
		end: "18:00",
	},

	Cashier: {
		workplace: "Supermarket",
		outsideVillage: false,
		start: "10:00",
		end: "20:00",
	},
};

module.exports = roleRoutines;
