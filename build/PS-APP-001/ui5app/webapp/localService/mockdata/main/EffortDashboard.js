module.exports = {
	getAllEntries: async function (odataRequest) {
		const oItems = await this.base.getEntityInterface("RfpEffortItem");
		const oHeaders = await this.base.getEntityInterface("RfpEffort");
		const aItems = await oItems.getAllEntries(odataRequest);
		const aHeaders = await oHeaders.getAllEntries(odataRequest);
		const mAgg = {};
		aItems.forEach((it) => {
			const sKey = [it.EffortId, it.SapModule, it.ActivatePhase, it.EntryType, it.Currency || ""].join("|");
			const oHdr = aHeaders.find((h) => h.EffortId === it.EffortId) || {};
			const o = mAgg[sKey] = mAgg[sKey] || {
				EffortId: it.EffortId, SapModule: it.SapModule, ActivatePhase: it.ActivatePhase,
				EntryType: it.EntryType, Currency: it.Currency || "", RfpName: oHdr.RfpName,
				CustomerName: oHdr.CustomerName, TotalEffort: 0, TotalCost: 0
			};
			o.TotalEffort += Number(it.EffortHours || 0);
			o.TotalCost += Number(it.Cost || 0);
		});
		return Object.values(mAgg).map((o) => Object.assign(o, {
			TotalEffort: o.TotalEffort.toFixed(2), TotalCost: o.TotalCost.toFixed(2)
		}));
	}
};
