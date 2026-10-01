const aRates = require("../rate/CostRate.json");

function derive(oItem, fOldCost) {
	const oRate = aRates.find((r) => r.SapModule === oItem.SapModule && r.Role === oItem.Role);
	const fHours = Number(oItem.EffortHours || 0);
	const fCost = Number(oItem.Cost || 0);
	const fCalc = oRate ? fHours * Number(oRate.Rate) : 0;
	const bManual = fCost !== Number(fOldCost || 0) && fCost !== 0 && (!oRate || fCost !== fCalc);
	if (bManual) {
		return { Cost: String(fCost), Currency: oItem.Currency || "", CostManualOverride: "X" };
	}
	if (oRate) {
		return { Cost: String(fCalc), Currency: oRate.Currency, CostManualOverride: "" };
	}
	if (oItem.CostManualOverride !== "X" && fCost !== 0) {
		return { Cost: "0", Currency: "", CostManualOverride: "" };
	}
	return { Cost: String(fCost), Currency: oItem.Currency || "", CostManualOverride: oItem.CostManualOverride || "" };
}

async function validate(oContributor, oItem, odataRequest) {
	if (!oItem.SapModule) { oContributor.throwError("Mandatory field missing: Module", 400); }
	if (!oItem.ActivatePhase) { oContributor.throwError("Mandatory field missing: Phase", 400); }
	if (!oItem.Role) { oContributor.throwError("Mandatory field missing: Role", 400); }
	if (Number(oItem.EffortHours) < 0) { oContributor.throwError("Effort must be zero or positive", 400); }
	if (Number(oItem.Cost) < 0) { oContributor.throwError("Cost must be zero or positive", 400); }
	if (oItem.EntryType === "ACT") {
		if (!oItem.ActivityDesc) { oContributor.throwError("Mandatory field missing: Activity Description", 400); }
		const oHeaders = await oContributor.base.getEntityInterface("RfpEffort");
		const aHeader = await oHeaders.fetchEntries({ EffortId: oItem.EffortId }, odataRequest);
		if (!aHeader[0] || aHeader[0].Status !== "WON") {
			oContributor.throwError('Project must be marked "Won" before logging actuals', 400);
		}
	}
}

module.exports = {
	addEntry: async function (mockEntry, odataRequest) {
		mockEntry.CreatedBy = "ANKUR";
		Object.assign(mockEntry, derive(mockEntry, 0));
		await validate(this, mockEntry, odataRequest);
		return this.base.addEntry(mockEntry, odataRequest);
	},

	onBeforeUpdateEntry: async function (keyValues, updatedData, odataRequest) {
		const aExisting = await this.base.fetchEntries(keyValues, odataRequest);
		const oMerged = Object.assign({}, aExisting[0], updatedData);
		await validate(this, oMerged, odataRequest);
		Object.assign(updatedData, derive(oMerged, aExisting[0] && aExisting[0].Cost));
	}
};
