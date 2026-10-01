module.exports = {
	executeAction: async function (actionDefinition, actionData, keys, odataRequest) {
		if (actionDefinition.name === "markAsWon") {
			await this.base.updateEntry(keys, { Status: "WON" }, odataRequest);
			const aRows = await this.base.fetchEntries(keys, odataRequest);
			return aRows[0];
		}
		return undefined;
	},

	addEntry: async function (mockEntry, odataRequest) {
		["RfpName", "CustomerName"].forEach((sField) => {
			if (!mockEntry[sField]) {
				this.throwError("Mandatory field missing: " + sField, 400);
			}
		});
		mockEntry.Status = mockEntry.Status || "EST";
		mockEntry.OwnerUser = mockEntry.OwnerUser || "ANKUR";
		mockEntry.CreatedBy = mockEntry.OwnerUser;
		return this.base.addEntry(mockEntry, odataRequest);
	}
};
