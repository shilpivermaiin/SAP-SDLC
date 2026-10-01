sap.ui.define([
	"zps/rfpeffortmgmt/controller/BaseController",
	"zps/rfpeffortmgmt/util/Constants",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/export/Spreadsheet"
], function (BaseController, Constants, JSONModel, Filter, FilterOperator, NumberFormat, Spreadsheet) {
	"use strict";

	var ALL = "";

	function emptyBucket() {
		return { effort: 0, cost: {} };
	}

	return BaseController.extend("zps.rfpeffortmgmt.controller.Dashboard", {
		onInit: function () {
			this._oNumber = NumberFormat.getFloatInstance({ maxFractionDigits: 2, groupingEnabled: true });
			this._aExportRows = [];
			this.getView().setModel(new JSONModel({
				view: "matrix", selectedRfp: ALL, rfps: [], matrix: [], summary: []
			}), "dash");
			this.getRouter().getRoute("dashboard").attachPatternMatched(this._load, this);
		},

		onFilterChange: function () {
			this._load();
		},

		_load: function () {
			var oModel = this.getOwnerComponent().getModel();
			var oDash = this.getView().getModel("dash");
			var sSelected = oDash.getProperty("/selectedRfp");
			var aFilters = sSelected ? [new Filter("EffortId", FilterOperator.EQ, sSelected)] : [];

			Promise.all([
				oModel.bindList("/EffortDashboard", null, null, aFilters).requestContexts(0, 10000),
				oModel.bindList("/RfpEffort").requestContexts(0, 1000)
			]).then(function (aResults) {
				var aRows = aResults[0].map(function (o) { return o.getObject(); });
				var aRfps = aResults[1].map(function (o) { return o.getObject(); });
				oDash.setProperty("/rfps", [{ key: ALL, text: this.getText("allRfps") }].concat(
					aRfps.map(function (r) { return { key: r.EffortId, text: r.RfpName }; })));
				oDash.setProperty("/selectedRfp", sSelected);
				this._build(aRows, oDash);
			}.bind(this)).catch(this.showError.bind(this));
		},

		_isActual: function (sType) {
			return sType === Constants.ENTRY.ACTUAL;
		},

		_add: function (oBucket, oRow) {
			oBucket.effort += Number(oRow.TotalEffort || 0);
			var sCur = oRow.Currency || "-";
			oBucket.cost[sCur] = (oBucket.cost[sCur] || 0) + Number(oRow.TotalCost || 0);
		},

		_fmtBucket: function (oBucket) {
			var aCost = Object.keys(oBucket.cost).filter(function (c) { return oBucket.cost[c] !== 0; }).map(function (c) {
				return (c === "-" ? "" : c + " ") + this._oNumber.format(oBucket.cost[c]);
			}.bind(this));
			return this._oNumber.format(oBucket.effort) + " " + this.getText("hoursUnit") +
				(aCost.length ? " | " + aCost.join(", ") : "");
		},

		_fmtVariance: function (oAct, oEst) {
			var aCur = Object.keys(oAct.cost).concat(Object.keys(oEst.cost)).filter(function (c, i, a) { return a.indexOf(c) === i; });
			var aCost = aCur.map(function (c) {
				var fDiff = (oAct.cost[c] || 0) - (oEst.cost[c] || 0);
				return (c === "-" ? "" : c + " ") + this._oNumber.format(fDiff);
			}.bind(this));
			return this._oNumber.format(oAct.effort - oEst.effort) + " " + this.getText("hoursUnit") +
				(aCost.length ? " | " + aCost.join(", ") : "");
		},

		_build: function (aRows, oDash) {
			var mMatrix = {};
			var mSummary = {};
			var mExport = {};

			aRows.forEach(function (oRow) {
				var bActual = this._isActual(oRow.EntryType);

				var mModule = mMatrix[oRow.SapModule] = mMatrix[oRow.SapModule] || {};
				var oCell = mModule[oRow.ActivatePhase] = mModule[oRow.ActivatePhase] || { est: emptyBucket(), act: emptyBucket() };
				this._add(bActual ? oCell.act : oCell.est, oRow);

				var oSum = mSummary[oRow.EffortId] = mSummary[oRow.EffortId] ||
					{ name: oRow.RfpName, customer: oRow.CustomerName, est: emptyBucket(), act: emptyBucket() };
				this._add(bActual ? oSum.act : oSum.est, oRow);

				var sKey = [oRow.EffortId, oRow.SapModule, oRow.ActivatePhase, oRow.Currency].join("|");
				var oExp = mExport[sKey] = mExport[sKey] || {
					rfp: oRow.RfpName, module: oRow.SapModule, phase: oRow.ActivatePhase, currency: oRow.Currency,
					estEffort: 0, actEffort: 0, estCost: 0, actCost: 0
				};
				oExp[bActual ? "actEffort" : "estEffort"] += Number(oRow.TotalEffort || 0);
				oExp[bActual ? "actCost" : "estCost"] += Number(oRow.TotalCost || 0);
			}.bind(this));

			var aMatrix = Constants.MODULES.filter(function (m) { return mMatrix[m]; }).map(function (sModule) {
				var oCells = {};
				Constants.PHASES.forEach(function (sPhase) {
					var oCell = mMatrix[sModule][sPhase] || { est: emptyBucket(), act: emptyBucket() };
					oCells[sPhase] = {
						est: this.getText("estimated") + " " + this._fmtBucket(oCell.est),
						act: this.getText("actual") + " " + this._fmtBucket(oCell.act)
					};
				}.bind(this));
				return { module: sModule, cells: oCells };
			}.bind(this));

			var aSummary = Object.keys(mSummary).map(function (sId) {
				var o = mSummary[sId];
				return {
					name: o.name, customer: o.customer,
					est: this._fmtBucket(o.est), act: this._fmtBucket(o.act), var: this._fmtVariance(o.act, o.est)
				};
			}.bind(this));

			this._aExportRows = Object.keys(mExport).map(function (k) { return mExport[k]; });
			oDash.setProperty("/matrix", aMatrix);
			oDash.setProperty("/summary", aSummary);
		},

		onExport: function () {
			var aColumns = [
				{ label: this.getText("colName"), property: "rfp" },
				{ label: this.getText("colModule"), property: "module" },
				{ label: this.getText("colPhase"), property: "phase" },
				{ label: this.getText("estimated") + " " + this.getText("colEffort"), property: "estEffort", type: "Number" },
				{ label: this.getText("actual") + " " + this.getText("colEffort"), property: "actEffort", type: "Number" },
				{ label: this.getText("estimated") + " " + this.getText("colCost"), property: "estCost", type: "Number" },
				{ label: this.getText("actual") + " " + this.getText("colCost"), property: "actCost", type: "Number" },
				{ label: this.getText("colCurrency"), property: "currency" }
			];
			var oSheet = new Spreadsheet({
				workbook: { columns: aColumns },
				dataSource: this._aExportRows,
				fileName: this.getText("exportFile")
			});
			oSheet.build().finally(function () { oSheet.destroy(); });
		}
	});
});
