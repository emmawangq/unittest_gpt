sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,MessageBox, FilterOperator,Filter,formatter) {
        "use strict";

        return BaseController.extend("dlw.lookup.controller.Productions", {
            formatter: formatter,

            onInit: function () {
                this.baseModelInit(); 
                if (this.oMainModel.getProperty("/query/wHNrs") == undefined || this.oMainModel.getProperty("/query/wHNrs").length == 0) {
                    this.getRouter().navTo("main", {});
                }
                this.getRouter().getRoute("productions").attachMatched(this._onRouteMatched, this);
                var that = this;
                this.getOwnerComponent().getModel().attachRequestFailed(function (oEvent) 
                    {
                        that._requestFailedHandler(oEvent)
                    });
            },


            /***************************/
            /*****  INITIALIZE ******/
            /***************************/

            _onRouteMatched : function (oEvent) {
                this.getView().setBusy(true);
                if (this.oMainModel.getProperty("/query/wHNrs") == undefined || this.oMainModel.getProperty("/query/wHNrs").length == 0) {
                    this.getRouter().navTo("main", {});
                }

                var oList = this.byId("listProduct"),
                oBinding = oList.getBinding("items");

                oBinding.filter(this._getProductFilters(), "Application");
            },

            /**
             * find WhseDesc from WarehouseSet item
             * @param {*} oEvent 
             */
            onUpdateFinished: function (oEvent) {
                this.getView().setBusy(false);
            },


            /**
             * Get filters
             * PartDesc: fuzzy search logic 
             */
            _getProductFilters: function() {
                var aFilters = [],
                    oQuery = this.oMainModel.getProperty("/query");

                if (oQuery){
                    if (this.oMainModel.getProperty("/rlVisible") === true) {
                        if (oQuery.serialNr !== undefined && oQuery.serialNr !== "" ) {
                            aFilters.push(new Filter("SerialNumDisp", FilterOperator.EQ, oQuery.serialNr));
                        }
                    } else {
                        if (oQuery.wHNrs !== undefined && oQuery.wHNrs.length !== 0 ) {
                            var aWhFilters = [];
                            oQuery.wHNrs.forEach(function (wh) {
                                aWhFilters.push(new Filter("Lgnum", FilterOperator.EQ, wh.Whseno));    
                            });
                            aFilters.push(new Filter(aWhFilters, false));
                        }
                        if (oQuery.partNr !== undefined && oQuery.partNr !== "" ) {
                            aFilters.push(new Filter("PartNum", FilterOperator.EQ, oQuery.partNr));
                        }
                        if (oQuery.partDesc !== undefined && oQuery.partDesc !== "" ) {
                            aFilters.push(new Filter("PartDesc", FilterOperator.Contains, oQuery.partDesc));
                        }
                        if (oQuery.bin !== undefined && oQuery.bin !== "" ) {
                            aFilters.push(new Filter("Bin", FilterOperator.EQ, oQuery.bin));
                        }
                        if (oQuery.serialNr !== undefined && oQuery.serialNr !== "" ) {
                            aFilters.push(new Filter("SerialNum", FilterOperator.EQ, oQuery.serialNr));
                        }
                        if (oQuery.batchNr !== undefined && oQuery.batchNr !== ""  ) {
                            if (!isNaN(oQuery.batchNr)) {
                                aFilters.push(new Filter("BatchNum", FilterOperator.EQ, oQuery.batchNr));
                            } else {
                                aFilters.push(new Filter("BatchNum", FilterOperator.EQ, oQuery.batchNr));
                            }
                        }
                    }
                }
                return aFilters;
            },


            /***************************/
            /*****  SERIAL NUMBER ******/
            /***************************/
            
            onPressSN: function (oEvent) {
                var product = oEvent.getSource().getBindingContext().getObject();
                this.oSerialNumbersModel.setProperty("/product", product);
                if (product && product.PartNum) {
                    this.getRouter().navTo("serialNumbers", {
                        productId: product.PartNum
                    });
                }
            },

            /***************************/
            /***** Error Handler ******/
            /***************************/
            _requestFailedHandler: function (oEvent) { 
                try {
                    var oResponse = oEvent.getParameter("response"),
                        parser = new DOMParser(),
                        xmlDoc = parser.parseFromString(oResponse.responseText, "text/xml"),
                        messages = xmlDoc.getElementsByTagName("message");
                    
                    if (messages.length > 0) {
                        var msg = messages[0].childNodes[0].nodeValue,
                            that = this;
                        MessageBox.error(msg, {
                            actions: [this.oI18n.getText("OK")],
                            emphasizedAction: this.oI18n.getText("OK"),
                            onClose: function (sAction) {
                                that.onNavBack();
                            }
                        });
                    }
                } catch (e) {
                //    console.log(e);
              }
            }
        });
    });
