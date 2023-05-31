sap.ui.define([
    "./BaseController",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/m/Token",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
	"../utils/ODataHandler",
    "../model/ScanType"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,FilterOperator,Filter,Sorter,Token,Fragment,ValueState, ODataHandler, ScanType) {

        "use strict";

        return BaseController.extend("dlw.lookup.controller.Main", {
            onInit: function () {
                this.baseModelInit(); 
                ODataHandler.setModel(this.getOwnerComponent().getModel());
                this._initData();
                
            },

            onAfterRendering: function () {
                if (this.getLogonUserId() === "") {
                    this.showError(this.oI18n.getText("NO_USER"));
                } 
                jQuery.sap.delayedCall(500, this, function() {
                    this.getView().byId("inpBin").focus();
                 });
            },

            /***************************/
            /*****  INITIALIZE  ******/
            /***************************/

            _initData: function () {
                this._oWarehouseDialog = null;
                this._getWarehouseData();
                this.getView().byId("btnGo").setEnabled(false);
    
                 //query param data
                 this.oMainModel.setProperty("/query", {
                    wHNrs: [],
                    partNr: "",
                    partDesc: "",
                    bin: "",
                    serialNr: "",
                    batchNr: ""
                });
                this.oMainModel.setProperty("/rlVisible", false);
            },

             /***************************/
            /*****  SCANDIT SDK ******/
            /***************************/


            /**
             * Set Scanner init parameter
             * support barcode coding
             * callback method
             */
            _configScanner: async function () {
                if (this.barcodePicker === null || this.barcodePicker === undefined || this.barcodePicker.destroyed === true) {
                    this.barcodePicker = await ScanditSDK.BarcodePicker.create(
                        document.getElementById(this.divId), { 
                        scanSettings: new ScanditSDK.ScanSettings({
                            enabledSymbologies: ["code128", "code39", "pdf417", "ean13", "ean8", "upca", "upce", "code93", "qr", "code11", "aztec", "codabar", "code25", "maxicode", "micropdf417", "msi-plessey", "databar", "databar-expanded", "two-digit-add-on", "five-digit-add-on", "databar-limited", "itf", "data-matrix", "micropdf417"],
                            searchArea: { x: 0, y: 0.3, width: 1, height: 0.3 }
                        }),
                        playSoundOnScan: true,
                        vibrateOnScan: true,
                        scanningPaused: true,
                        visible: false
                    });
                    this.barcodePicker.setLaserArea({ x: 0, y: 0.3, width: 1, height: 0.3 });
                    // this.barcodePicker.setGuiStyle("viewfinder");
                    // this.barcodePicker.setVideoFit("cover");


                    // set the callback function for scan results of the BarcodePicker
                    this.barcodePicker.on("scan", (scanResult) => {
                        var code = scanResult.barcodes[0].data;
                        if (code === "" || code === undefined ){
                            this.showMessageToast(this.oI18n.getText("INCORRECT_BARCODE"));
                        }
                        if(this._scanType === ScanType.Bin) {
                            this.onBinChange(code);
                        } else if(this._scanType === ScanType.Part) {
                            this.onPartChange(code);
                        } else if(this._scanType === ScanType.SN) {
                            this.onSNChange(code);
                        }
                        // pause scanning
                        this._stopScanner();
                    });
                    
                }
            },

            /**
             * set scanner
             */
            _startScanner: async function () {
                await this._configScanner();
                this.oMainModel.setProperty("/scannerVisible", true);
                this.barcodePicker.setVisible(true);
                this.barcodePicker.resumeScanning();
            },

            _destroyScanner: function () {
                if (this.barcodePicker) {
                    this.barcodePicker.accessCamera = false
                    this.barcodePicker.destroy();
                }
            },

            _stopScanner: function () {
                this.barcodePicker.pauseScanning(true);
                this.barcodePicker.setVisible(false);
                this.oMainModel.setProperty("/scannerVisible", false);
            },

            onPressCancelScan: function () {
                this._stopScanner();
            },

            /***************************/
            /*****  SEGEMENT BUTTON  ******/
            /***************************/

            // onRLChange: function (oEvent) {
            //     var oUser = oEvent.getSource(),
            //     sKey = oUser.getSelectedKey();
            //     if (sKey && sKey === "R") {
            //         this._clearData();
            //         this.oMainModel.setProperty("/rlVisible", true);
            //         this.getView().byId("inpSerialNumber").setRequired(true);
            //     } else {
            //         this.oMainModel.setProperty("/rlVisible", false);
            //         this.getView().byId("inpSerialNumber").setRequired(false);
            //     }
            // },

            /***************************/
            /*****  WAREHOUSE  ******/
            /***************************/

            /**
             * copy data to json model
             * for multiInput token update event
             * SelectDialog is independent with multiInput
             * @param {} sWhseNo 
             */
            _getWarehouseData: function () {
                var sUrl = "WarehouseSet",
                    aFilter = this._getWarehouseFilters(""),
                    aSorters = this._getWarehouseSorter(),
                    that = this;
                ODataHandler.GETData(this, sUrl, aFilter, aSorters)
                .then(function (res) {
                   that._handleWarehouseResponse(res);
                }).catch(function (error) {
                    that._errorHandler(error);
                });
            },

            /**
             * copy warehouse to jsonmodel
             * auto select if only one warehouse
             * @param {*} res 
             */
            _handleWarehouseResponse: function (res) {
                var arr = [];
                if (res.results !== undefined && res.results.length > 1) {
                    res.results.forEach(wh => {
                        wh.selected = false;
                        arr.push(wh);
                    });
                } else if (res.results !== undefined && res.results.length === 1) {
                    var wh = res.results[0];
                    wh.selected = true;
                    arr.push(wh);
                    this.getView().byId("miWarehouse").addToken(new Token({
                        text: wh.Whseno
                    }));
                }
                this.oMainModel.setProperty("/allWarehouse", arr);
            },

            /**
             * Open ValueHelp dialog
             */
		    handleWHValueHelp: function () {
                // create value help dialog
                var oView = this.getView(),
                    that = this;
                if (!this._oWarehouseDialog) {
                    this._oWarehouseDialog = Fragment.load({
                        id: oView.getId(),
                        name: "dlw.lookup.view.fragments.WarehouseDialog",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }

                var tokens = this.byId("miWarehouse").getTokens();
                var arr = this.oMainModel.getProperty("/allWarehouse");
			    for (var i = 0; i < arr.length; i++) {
                    arr[i].selected = false;
                    for (var j = 0; j < tokens.length; j++) {
                        if (arr[i].Whseno === tokens[j].getText()) {
                            arr[i].selected = true;
                        }
                    }
                }
				this.oMainModel.setProperty("/allWarehouse", arr);
                this._oWarehouseDialog.then(function (oValueHelpDialog) {
                    oValueHelpDialog.open();
                    oValueHelpDialog.getBinding("items").filter([], "Application");
                });
            },

            /**
             * Event in warehouse dialog
             * Confirm selected wh in fragment
             * @param {} oEvent 
             */
            onWHConfirm: function (oEvent) {
                var arr = this.oMainModel.getProperty("/allWarehouse"),
				    oMultiInput = this.byId("miWarehouse");

                oMultiInput.removeAllTokens();
                if (arr && arr.length > 0) {
                    arr.forEach(function (item) {
                        if (item.selected === true) {
                            oMultiInput.addToken(new Token({
                                text: item.Whseno
                            }));
                        }
                    });
                }
                this._setGoBtnState();
            },

            /**
             * Confirm selected wh in fragment
             * @param {} oEvent 
             */
            onWHSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var aFilters = this._getWarehouseFilters(sValue);
                oEvent.getSource().getBinding("items").filter(aFilters, "Application");
            },

            _getSelectedWarehouse: function () {
                var arr = [];
                this.oMainModel.getProperty("/allWarehouse").forEach(wh => {
                    if (wh.selected === true) {
                        arr.push(wh);
                    }
                });
                this.oMainModel.setProperty("/query/wHNrs", arr);
            },

            /**
             * Filter for AssignedWarehouseSet
             * by UserID & user entered warehouse
             */
            _getWarehouseFilters: function (sWH) {
                var aFilters = [],
                    sUser = this.getLogonUserId();
                if (sUser && sUser !== "") {
                    aFilters.push(new Filter("Userid", FilterOperator.EQ, sUser));
                }
                if (sWH !== "" && sWH !== undefined) {
                    var arr = [];
                    arr.push(new Filter("Whseno", FilterOperator.Contains, sWH));
                    arr.push(new Filter("Whsedesc", FilterOperator.Contains, sWH));
                    arr.push(new Filter("City", FilterOperator.Contains, sWH));
                    aFilters.push (new Filter(arr, false));
                }
                return aFilters;
            },

            /**
             * @returns {*[]}
             * @private
             */
            _getWarehouseSorter: function () {
                var aSorters = [];
                aSorters.push(new Sorter("City", true, true));
                return aSorters;
            },

            _showWarehouseError: function (sWhseNo) {
                this.showMessageToast(this.oI18n.getText("INVALID_WAREHOUSE", [this.getLogonUserId(), sWhseNo]));
                this.getView().byId("miWarehouse").setValueState(ValueState.Error);
            },
            
            /***************************/
            /*****  SCAN BIN  ******/
            /***************************/

            /**
             * 5119;2369797;001;NEW;A-03-A-04
             */
            onPressScanBin: function () {
                this._scanType = ScanType.Bin;
                this._startScanner();
            },

            onBinSubmit: function (oEvent){
                var sBin = oEvent.getSource().getValue();
                if (sBin !== undefined && sBin !== "") {
                    this.onBinChange(sBin);
                }
                this.getView().byId("inpPartNumber").focus();
            },

            /**
             * Support two type of input
             * Barcode: 1079834;001;NEW;W-002
             *          Product;Valuation/Batch;Bin
             *          Valuation is not used in this app
             * Storage Bin: A-03-A-04
             */
            onBinChange: function (sScanResult) {
                if (sScanResult !== undefined && sScanResult !== "") {
                    var partsOfStr = this._parseBarcode(sScanResult);
                    if (partsOfStr !== undefined && partsOfStr.length === 3) {
                        this.oMainModel.setProperty("/query/bin", partsOfStr[2]);
                        this.getView().byId("inpPartNumber").focus();
                    }
                }
                this._setGoBtnState();
            },

            /**
             * bin input field change vent
             */
            handleBinChange: function (oEvt) {
                this.onBinChange(oEvt.getSource().getValue());
            },

            /****************************
            SCAN PART NR
            ***************************/

            onPressScanPart:function () {
                this._scanType = ScanType.Part;
                this._startScanner();
            },

            onPartChange: function (sScanResult) {
                if (sScanResult !== undefined && sScanResult !== "") {
                    var partsOfStr = this._parseBarcode(sScanResult);
                    if (partsOfStr !== undefined && partsOfStr.length === 3) {
                        //only Bin need to be filled in on the screen
                        this.oMainModel.setProperty("/query/partNr", partsOfStr[0]);
                        this.getView().byId("inpPartNumber").focus();
                    } 
                }
                this._setGoBtnState();
            },

            /**
             * Parse barcode
             * Warehouse;Part;Valuation;Batch;Bin
             * Product;Valuation/Batch;Bin
             * @param {*} sValue 
             */
            _parseBarcode: function (sValue){
                var partsOfStr;
                if (sValue && (typeof sValue === 'string' || sValue instanceof String) && sValue.includes(";")) {
                    partsOfStr = sValue.split(";");
                    this.oMainModel.setProperty("/scanResult/barcode", sValue);
                    if (partsOfStr && partsOfStr.length !== 3) {
                        this.showError(this.oI18n.getText("INCORRECT_BARCODE"));
                    }
                } 
                return partsOfStr;
            },

            /**
             * Clear query param
             */
            _clearData: function () {
                this.oMainModel.setProperty("/query/partNr", "" );
                this.oMainModel.setProperty("/query/batchNr", "" );
                this.oMainModel.setProperty("/query/bin", "" );
            },

            /**
             * PartNr input field change event
             * 
             */
            onPartNrChange: function (oEvt) {
                this.onPartChange(oEvt.getSource().getValue());
            },

            /****************************
            SCAN SERIAL NR
            ***************************/

            onPressScanSN: function () {
                this._scanType = ScanType.SN;
                this._startScanner();
                
            },

            onSNChange: function (sn) {
                this.oMainModel.setProperty("/query/serialNr", sn);
                this._setGoBtnState();
            },

            /***************************/
            /*****  Submit event  ******/
            /***************************/
          
            onPartNrSubmit: function () {
                this._setGoBtnState();
                this.getView().byId("inpPartDesc").focus();
            },


            onPartDescSubmit: function () {
                this._setGoBtnState();
                this.getView().byId("inpSerialNumber").focus();
            },

            onSNSubmit: function () {
                this._setGoBtnState();
                if (this.oMainModel.getProperty("/rlVisible") === true) {
                    this.onPressGo();
                } else {
                    this.getView().byId("inpBatch").focus();
                }
            },

            onBatchSubmit: function () {
                this._setGoBtnState();
                this.onPressGo();
            },


            /***************************/
            /*****  GO  ******/
            /***************************/
            _setGoBtnState: function () {
                this.getView().byId("btnGo").setEnabled(this._verifyInput());
            },

            onPressGo: function () {

                if ( this._verifyInput() === false ){
                    // console.log("on Press Go..... ");
                    this.showMessageToast(this.oI18n.getText("NO_PARAM"));
                    return;
                }
                this.getRouter().navTo("productions", {});
            },

            _verifyInput: function (){
                if (this.oMainModel.getProperty("/rlVisible") === false ) {
                    if (!this.oMainModel.getProperty("/query") || (this.oMainModel.getProperty("/query/partNr") === "" &&
                        this.oMainModel.getProperty("/query/partDesc") === "" &&
                        this.oMainModel.getProperty("/query/bin") === "" &&
                        this.oMainModel.getProperty("/query/serialNr") === "" &&
                        this.oMainModel.getProperty("/query/batchNr") === "" ) || 
                        this.getView().byId("miWarehouse").getTokens() === undefined || 
                        this.getView().byId("miWarehouse").getTokens().length === 0) {
                        return false;
                    }
                } else {
                    return this.oMainModel.getProperty("/query/serialNr") === "" ? false : true;
                }
                this._getSelectedWarehouse();
                return true;
            },


            /***************************/
            /*****  GENERAL  ******/
            /***************************/

            /**
             * for input fields live change
             * live change event: the value is not set to model yet
             * @param {} oEvent 
             */
            onLiveChange:function () {
               this._setGoBtnState();
            },

            /**
             * submit call error handling
             * @param {error} error response from odata call
             * @private
             */
            _errorHandler: function (error) {
                var msg = error.responseText? error.responseText : (error.message? error.message : this.oI18n.getText("CONNECTION_ERROR"));
                try {
                    if (error && error.responseText) {
                        var responseText = JSON.parse(error.responseText);
                        msg = responseText.error.message.value ? responseText.error.message.value : msg;
                    }
                } catch (e) {
                    // console.log(e);
                }
                this.showError(msg);
            }

    
        });
    });
