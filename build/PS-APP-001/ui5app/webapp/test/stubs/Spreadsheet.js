// Preview-only stand-in for sap.ui.export.Spreadsheet (not part of OpenUI5): downloads a CSV.
sap.ui.define([], function () {
	"use strict";

	function Spreadsheet(mSettings) {
		this._mSettings = mSettings;
	}

	Spreadsheet.prototype.build = function () {
		var aColumns = this._mSettings.workbook.columns;
		var aRows = [aColumns.map(function (c) { return c.label; })].concat(
			this._mSettings.dataSource.map(function (o) {
				return aColumns.map(function (c) { return o[c.property]; });
			}));
		var sCsv = aRows.map(function (r) { return r.map(function (v) { return '"' + String(v === undefined ? "" : v).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
		var oLink = document.createElement("a");
		oLink.href = URL.createObjectURL(new Blob([sCsv], { type: "text/csv" }));
		oLink.download = this._mSettings.fileName.replace(/\.xlsx$/, ".csv");
		document.body.appendChild(oLink);
		oLink.click();
		document.body.removeChild(oLink);
		return Promise.resolve();
	};

	Spreadsheet.prototype.destroy = function () {};

	return Spreadsheet;
});
