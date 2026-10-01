sap.ui.define(["zps/rfpeffortmgmt/util/Constants"], function (Constants) {
	"use strict";

	return {
		statusText: function (sStatus) {
			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			if (sStatus === Constants.STATUS.WON) {
				return oBundle.getText("statusWon");
			}
			return sStatus === Constants.STATUS.ESTIMATE ? oBundle.getText("statusEstimate") : sStatus;
		},

		statusState: function (sStatus) {
			return sStatus === Constants.STATUS.WON ? "Success" : "Warning";
		},

		isEstimate: function (sStatus) {
			return sStatus === Constants.STATUS.ESTIMATE;
		},

		isWon: function (sStatus) {
			return sStatus === Constants.STATUS.WON;
		},

		phaseText: function (sPhase) {
			return sPhase ? sPhase.charAt(0) + sPhase.slice(1).toLowerCase() : "";
		}
	};
});
