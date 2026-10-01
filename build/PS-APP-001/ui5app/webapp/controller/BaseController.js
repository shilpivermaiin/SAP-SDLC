sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, History, MessageBox, MessageToast) {
	"use strict";

	return Controller.extend("zps.rfpeffortmgmt.controller.BaseController", {
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		getText: function (sKey, aArgs) {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
		},

		onNavBack: function () {
			if (History.getInstance().getPreviousHash() !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("list", {}, true);
			}
		},

		showError: function (oError) {
			var sMessage = (oError && oError.message) || this.getText("errorGeneric");
			MessageBox.error(sMessage);
		},

		showSuccess: function (sKey) {
			MessageToast.show(this.getText(sKey));
		}
	});
});
