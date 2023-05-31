sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
    "sap/ui/dom/includeScript",
    "sap/m/MessageBox",
	"sap/m/MessageToast",
    "../utils/ODataHandler"
], function (Controller, History, includeScript, MessageBox, MessageToast, ODataHandler) {
	"use strict";

	return Controller.extend("dlw.lookup.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/*
		 * to init all model in base controller.
		 */
		baseModelInit: function () {
            //for testing 
            this.test = false;  // false true
            
			this.oDataModel = this.getOwnerComponent().getModel();
			this.oI18n = this.getResourceBundle();
			this.oMainModel = this.getOwnerComponent().getModel("MainModel");
			this.oMainModel.setProperty("/userId", this.getLogonUserId());
            this.oProductionsModel = this.getOwnerComponent().getModel("ProductionsModel");
            this.oSerialNumbersModel = this.getOwnerComponent().getModel("SerialNumbersModel");
            this.oScanOutModel = this.getOwnerComponent().getModel("ScanOut");
            
            this.initScandit();
		},

         //**************** SCANDIT LICENSE KEY *********************/

         /**
          * GET SCANDIT LICENSE KEY FROM API
          */
		  initScandit: function () {
            var devKey = "AW7yHwObIbFtEL1wmibBX/cet/ClBNVHLQ7jy/cngmbCeve6GEvXpAAntEa7dHtvPDgY2WNJ8qAERoIorQgiSMZG61DHLqW4B3W187NayrZnSoShi0VHS5JgWOpzYdtJJirGcU8UL8Y/Hu/nbjYeAyIB2CFrX0LbKGjX1ECwb1teQcnI3CcRCE6yvp8gwyBQiXTutP3jyRu+7/echucBYkSNDknTYPkcmeAF2OmpZ1XAj/XXuEWLsRcNbWtF6hqNh0NRzmgQxapmNhobtaT1xvDEFwfXP3KVV+wQtTZ/MOph5iCQMs9VSPT9TJ/37petMk7jHpK2M3yLu2SayGCyUzzswXxXzHoSSRAqj34HA3w92WLpopySXddY+/PSaZ4iJK3n9916U2o98/0aqqTBrm4RM3s8a6yoSAuDhZCTbOEyNw3+lpuGYZ8xV/Joagr31E3f8s8X3aycfN/0xRFT3IZ05yKAvnz3HoLEJlnAZAV6NfkfdTATX+6XrXMY+od0YhTLYYbQu2OCcStfMG011v0U+ezgeh/5PN2DkZ+0rfmIot6ut6CGUAZSmpYqMYN1djBrGOT8TmU4iPwpGas1U8jdZt+Vi3xxewkJQJIDA5wiwVQAdBH+4e3XOpTXcatT+NKB/XXCPRG1J/fbz29GTetC3/Z22PiT6p4Te6nOI3RK4DAAOAEquXStjpCRwJvWx2eypBcHodBsVVGNWXA/VHn2yNXPRlYdyVoCX5OXoAuHsRseQ4EfUMopmtzyurWGyaDPD4nx/k5m0qJbbkUDKZ4IvMciXHVMo6MnvJkaQikPHkPrjCzlWekvfQ+dzo4=";
            if (this.test === true) {
                this._initScanner(devKey);
            } else {
                ODataHandler.setModel(this.oDataModel);
            
                var sUrl = "ScanditSet(License='')",
                that = this;
                ODataHandler.GETData(this, sUrl, null, null)
                .then(function (res) {
                    var key = (res !== undefined && res.License !== undefined)? res.License : devKey;
                    that._initScanner(key);
                    console.log("API Key ---" ,key);
                    that.oMainModel.setProperty("/scanditKey", key );
                }).catch(function (e) {
                    console.log(e);
                    that._initScanner(devKey);
					that.oMainModel.setProperty("/scanditKey", key );
                });	
            }
        },

        /**
         * Create Scanner with online library
         * license key
         */
        _initScanner: async function (licenseKey) {
            this.divId = this.createId("scandit-barcode-picker"); 
            await includeScript({url:"https://cdn.jsdelivr.net/npm/scandit-sdk@5.12.1/build/browser/index.js"});
            
            await ScanditSDK.configure(licenseKey,
            {
                engineLocation: "https://cdn.jsdelivr.net/npm/scandit-sdk/build/", // path to scan engine
            });
        },


		/**
		 * Event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("main", {});
			}
		},

		getLaunchpadUser: function () {
            var user = this.test? "WANGQ" : ""; //
			if (sap.ushell && sap.ushell.Container.getService("UserInfo")) {
				var temp = sap.ushell.Container.getService("UserInfo").getId();
                user = (temp === "DEFAULT_USER" || temp === "" || temp === undefined)? user : temp;  
                console.log("Get User from Ushell, ", user);
			} else {
                console.log("CANNOT get user from Ushell return ''");
            }
			return user;
		},

		getLogonUserId: function () {
			var userId = this.oMainModel.getProperty("/userId");
			if (userId === undefined) {
				userId = this.getLaunchpadUser();
                this.oMainModel.setProperty("/userId",userId );
			}
			return userId;
		},

        //**************** MSG BOX METHOD *********************/
	    /*
		 * Method that creates an error message box
		 * @public
		 * @param {sErrorMessage} the error message text type String
		 */
		showMessageSuccessBox: function (sSucessMsg) {
			MessageBox.success(sSucessMsg);
		},

		/*
		 * Method that creates an message toast
		 * @public
		 * @param {sErrorMessage} the error message text type String
		 */
		showMessageToast: function (sMessage) {
			MessageToast.show(sMessage);
		},

        
		showError: function (sErrorMessage) {
			MessageBox.error(sErrorMessage, {
				details: ""
			});
		},

		showBusy: function () {
			this.getView().setBusy(true);
		},

		hideBusy: function () {
			this.getView().setBusy(false);
		},

         /**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		}

	});

});