sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Messaging"
], function (Controller, History, MessageBox, MessageToast, Messaging) {
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

		// OData V4 reports a failed create through "createCompleted", not by rejecting created().
		// Resolves with the created context, or rejects with the server's error message and drops the transient row.
		createEntry: function (oBinding, oData, bAtEnd) {
			return new Promise(function (resolve, reject) {
				var oContext = oBinding.create(oData, false, bAtEnd);
				oContext.created().catch(function () { /* rejected when a failed creation is cancelled below */ });
				var fnCompleted = function (oEvent) {
					if (oEvent.getParameter("context") !== oContext) {
						return;
					}
					oBinding.detachCreateCompleted(fnCompleted);
					if (oEvent.getParameter("success")) {
						resolve(oContext);
						return;
					}
					var aErrors = Messaging.getMessageModel().getData().filter(function (oMessage) {
						return oMessage.getType() === "Error";
					});
					var sMessage = aErrors.length ? aErrors[aErrors.length - 1].getMessage() : undefined;
					Messaging.removeMessages(aErrors);
					oContext.delete().catch(function () { /* creation is cancelled on purpose */ });
					reject({ message: sMessage });
				};
				oBinding.attachCreateCompleted(fnCompleted);
			});
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
