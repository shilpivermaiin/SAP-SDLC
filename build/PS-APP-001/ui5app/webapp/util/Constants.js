sap.ui.define([], function () {
	"use strict";

	return {
		MODULES: ["SD", "MM", "FI", "CO", "PP", "QM", "PM", "PS", "EWM", "HCM"],
		PHASES: ["PREPARE", "EXPLORE", "REALIZE", "DEPLOY", "RUN"],
		STATUS: { ESTIMATE: "EST", WON: "WON" },
		ENTRY: { ESTIMATE: "EST", ACTUAL: "ACT" },
		ACTION_NAMESPACE: "com.sap.gateway.srvd.z_ui_pseffrthdr.v0001"
	};
});
