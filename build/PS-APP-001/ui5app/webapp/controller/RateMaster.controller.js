sap.ui.define([
	"zps/rfpeffortmgmt/controller/BaseController",
	"zps/rfpeffortmgmt/util/Constants",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/Messaging"
], function (BaseController, Constants, JSONModel, Fragment, Messaging) {
	"use strict";

	return BaseController.extend("zps.rfpeffortmgmt.controller.RateMaster", {
		onInit: function () {
			var oView = this.getView();
			oView.setModel(new JSONModel({
				modules: Constants.MODULES.map(function (s) { return { key: s, text: s }; })
			}), "ref");
			oView.setModel(new JSONModel({}), "newrate");
			Messaging.registerObject(oView, true);
		},

		onAdd: function () {
			var oView = this.getView();
			oView.getModel("newrate").setData({ SapModule: "", Role: "", Rate: "", Currency: "" });
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "zps.rfpeffortmgmt.fragment.AddRate",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pDialog.then(function (oDialog) { oDialog.open(); });
		},

		onAddConfirm: function () {
			var oData = this.getView().getModel("newrate").getData();
			var oContext = this.byId("rateTable").getBinding("items").create({
				SapModule: oData.SapModule,
				Role: oData.Role,
				Rate: oData.Rate === "" ? "0" : String(oData.Rate),
				Currency: oData.Currency
			});
			oContext.created().then(function () {
				this._pDialog.then(function (oDialog) { oDialog.close(); });
				this.showSuccess("savedSuccess");
			}.bind(this)).catch(function (oError) {
				if (!oError.canceled) {
					this.showError(oError);
				}
			}.bind(this));
		},

		onAddCancel: function () {
			this._pDialog.then(function (oDialog) { oDialog.close(); });
		},

		onDelete: function (oEvent) {
			oEvent.getSource().getBindingContext("rate").delete("$auto").then(function () {
				this.showSuccess("deletedSuccess");
			}.bind(this)).catch(this.showError.bind(this));
		}
	});
});
