sap.ui.define([
	"zps/rfpeffortmgmt/controller/BaseController",
	"zps/rfpeffortmgmt/util/formatter",
	"zps/rfpeffortmgmt/util/Constants",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/Messaging",
	"sap/m/MessageBox"
], function (BaseController, formatter, Constants, JSONModel, Fragment, Messaging, MessageBox) {
	"use strict";

	return BaseController.extend("zps.rfpeffortmgmt.controller.Detail", {
		formatter: formatter,

		onInit: function () {
			var oView = this.getView();
			oView.setModel(new JSONModel({
				modules: Constants.MODULES.map(function (s) { return { key: s, text: s }; }),
				phases: Constants.PHASES.map(function (s) { return { key: s, text: formatter.phaseText(s) }; })
			}), "ref");
			oView.setModel(new JSONModel({}), "line");
			Messaging.registerObject(oView, true);
			this.getRouter().getRoute("detail").attachPatternMatched(this._onMatched, this);
		},

		_onMatched: function (oEvent) {
			var sEffortId = oEvent.getParameter("arguments").effortId;
			this.getView().bindElement({ path: "/RfpEffort(" + sEffortId + ")" });
		},

		onDashboard: function () {
			this.getRouter().navTo("dashboard");
		},

		onMarkAsWon: function () {
			var oContext = this.getView().getBindingContext();
			MessageBox.confirm(this.getText("markAsWonConfirm"), {
				onClose: function (sAction) {
					if (sAction !== MessageBox.Action.OK) {
						return;
					}
					var oAction = this.getView().getModel().bindContext(
						Constants.ACTION_NAMESPACE + ".markAsWon(...)", oContext);
					oAction.execute().then(function () {
						oContext.refresh();
						this.showSuccess("markAsWonDone");
					}.bind(this)).catch(this.showError.bind(this));
				}.bind(this)
			});
		},

		onAddEstimate: function () {
			this._openLineDialog(Constants.ENTRY.ESTIMATE, "estimateTable", "lineTitleEstimate");
		},

		onAddActual: function () {
			this._openLineDialog(Constants.ENTRY.ACTUAL, "actualTable", "lineTitleActual");
		},

		_openLineDialog: function (sEntryType, sTableId, sTitleKey) {
			var oView = this.getView();
			this._sTableId = sTableId;
			oView.getModel("line").setData({
				title: this.getText(sTitleKey),
				EntryType: sEntryType,
				isActual: sEntryType === Constants.ENTRY.ACTUAL,
				SapModule: "", ActivatePhase: "", Role: "", EffortHours: "", Cost: "", Currency: "", ActivityDesc: ""
			});
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "zps.rfpeffortmgmt.fragment.AddLine",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pDialog.then(function (oDialog) { oDialog.open(); });
		},

		onAddLineConfirm: function () {
			var oLine = this.getView().getModel("line").getData();
			var oData = {
				EntryType: oLine.EntryType,
				SapModule: oLine.SapModule,
				ActivatePhase: oLine.ActivatePhase,
				Role: oLine.Role,
				EffortHours: oLine.EffortHours === "" ? "0" : String(oLine.EffortHours),
				ActivityDesc: oLine.ActivityDesc
			};
			if (oLine.Cost !== "") {
				oData.Cost = String(oLine.Cost);
				oData.Currency = oLine.Currency;
			}
			var oContext = this.byId(this._sTableId).getBinding("items").create(oData, false, true);
			oContext.created().then(function () {
				this._pDialog.then(function (oDialog) { oDialog.close(); });
				this.showSuccess("savedSuccess");
			}.bind(this)).catch(function (oError) {
				if (!oError.canceled) {
					this.showError(oError);
				}
			}.bind(this));
		},

		onAddLineCancel: function () {
			this._pDialog.then(function (oDialog) { oDialog.close(); });
		},

		onDeleteLine: function (oEvent) {
			oEvent.getSource().getBindingContext().delete("$auto").then(function () {
				this.showSuccess("deletedSuccess");
			}.bind(this)).catch(this.showError.bind(this));
		}
	});
});
