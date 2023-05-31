sap.ui.define([
	"sap/ui/model/Filter"
], function (Filter) {
	"use strict";

	var oModel = null;

	return {

		setModel: function (oDataModel) {
			oModel = oDataModel;
		},

		/*
		 * Generic method that posts data to the service
		 * @public
		 * @param {that} the view
		 * @param {serviceExtend} the path to the specific entitie set
		 * @param {oPayload} the payload that needs to be POSTed
		 * @return {promise} returns the promise with either the data or an errormessage
		 */
		POSTData: function (that, serviceExtend, oPayload) {
			that.getView().setBusy(true);
			oModel.setUseBatch(false);
			return new Promise(function (resolve, reject) {
				var sUrl = "/" + serviceExtend;

				oModel.create(sUrl, oPayload, {
					success: function (oData) {
						that.getView().setBusy(false);
						resolve(oData);
					},
					error: function (oError) {
						that.getView().setBusy(false);
						reject(oError);
					}
				});
			});
		},

		/*
		 * Generic method that gets data from the service
		 * @public
		 * @param {self} the view
		 * @param {serviceExtend} the path to the specific entitie set
		 * @param {aFilters} an array of filters can be null
		 * @return {promise} returns the promise with either the data or an errormessage
		 */
		GETData: function (that, serviceExtend, aFilters, aSorters) {
			that.getView().setBusy(true);
			return new Promise(function (resolve, reject) {
				var url = "/" + serviceExtend;
				oModel.read(url, {
					filters: aFilters,
                    sorters: aSorters,
					success: function (oData) {
						that.getView().setBusy(false);
						resolve(oData);
					},
					error: function (oError) {
						that.getView().setBusy(false);
						reject(oError);
					}
				});
			});
		},

        /*
		 * Generic method that posts data to the service
		 * @public
		 * @param {that} the view
		 * @param {serviceExtend} the path to the specific entitie set
		 * @param {oPayload} the payload that needs to be POSTed
		 * @return {promise} returns the promise with either the data or an errormessage
		 */
		callFunction: function (that, serviceExtend, oUrlParams, oPayload) {
			that.getView().setBusy(true);
			var sUrl = "/" + serviceExtend;
			return new Promise(function (resolve, reject) {
				oModel.callFunction(
					sUrl, {
						method: "POST",
						urlParameters: oUrlParams,
						success: function (oData) {
							that.getView().setBusy(false);
							resolve(oData);
						},
						error: function (oError) {
							that.getView().setBusy(false);
							reject(oError);
						}
					});
			});
		},

	};
});