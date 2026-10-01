sap.ui.define(["zps/rfpeffortmgmt/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("zps.rfpeffortmgmt.controller.App", {
		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});
