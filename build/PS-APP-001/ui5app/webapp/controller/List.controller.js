sap.ui.define([
	"zps/rfpeffortmgmt/controller/BaseController",
	"zps/rfpeffortmgmt/util/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel"
], function (BaseController, formatter, Filter, FilterOperator, Fragment, JSONModel) {
	"use strict";

	return BaseController.extend("zps.rfpeffortmgmt.controller.List", {
		formatter: formatter,

		onInit: function () {
			this.getView().setModel(new JSONModel({ RfpName: "", CustomerName: "", OwnerUser: "" }), "new");
		},

		onSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			var aFilters = sQuery ? [new Filter({
				filters: [
					new Filter("RfpName", FilterOperator.Contains, sQuery),
					new Filter("CustomerName", FilterOperator.Contains, sQuery)
				],
				and: false
			})] : [];
			this.byId("rfpTable").getBinding("items").filter(aFilters);
		},

		onSelect: function (oEvent) {
			var sEffortId = oEvent.getSource().getBindingContext().getProperty("EffortId");
			this.getRouter().navTo("detail", { effortId: sEffortId });
		},

		onDashboard: function () {
			this.getRouter().navTo("dashboard");
		},

		onRates: function () {
			this.getRouter().navTo("rates");
		},

		onCreate: function () {
			var oView = this.getView();
			this.getView().getModel("new").setData({ RfpName: "", CustomerName: "", OwnerUser: "" });
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "zps.rfpeffortmgmt.fragment.CreateRfp",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		onCreateConfirm: function () {
			var oData = this.getView().getModel("new").getData();
			this.createEntry(this.byId("rfpTable").getBinding("items"), {
				RfpName: oData.RfpName,
				CustomerName: oData.CustomerName,
				OwnerUser: oData.OwnerUser
			}).then(function (oContext) {
				this._pDialog.then(function (oDialog) { oDialog.close(); });
				this.showSuccess("savedSuccess");
				this.getRouter().navTo("detail", { effortId: oContext.getProperty("EffortId") });
			}.bind(this)).catch(this.showError.bind(this));
		},

		onCreateCancel: function () {
			this._pDialog.then(function (oDialog) { oDialog.close(); });
		}
	});
});
