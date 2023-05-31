sap.ui.define([
    "./BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
	"../utils/ODataHandler"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,Fragment,FilterOperator,Filter,ODataHandler) {
        "use strict";

        return BaseController.extend("dlw.lookup.controller.SerialNumbers", {
            onInit: function () {
                this.baseModelInit(); 
                var oRouter = this.getRouter();

                oRouter.getRoute("serialNumbers").attachMatched(this._onRouteMatched, this);
            },

            _onRouteMatched : function (oEvent) {
                var oArgs, oView;
    
                oArgs = oEvent.getParameter("arguments");
                oView = this.getView();
                console.log(oArgs.productId); 

                var oList = this.byId("listSNs"),
                    oBinding = oList.getBinding("items");
                    oBinding.filter(this._getSNFilters(oArgs.productId)); 
            },

            /**
             * Get filters
             * PartDesc: fuzzy search logic 
             */
            _getSNFilters: function(sProductId) {
                var aFilters = [],
                    oProduct = this.oSerialNumbersModel.getProperty("/product");

                if (sProductId !== undefined && sProductId !== "" ) {
                    aFilters.push(new Filter("MaterialNumber", FilterOperator.EQ, sProductId));
                }

                if (oProduct){
                    if (oProduct.Lgnum !== undefined && oProduct.Lgnum !== "") {
                        aFilters.push(new Filter("WhseNo", FilterOperator.EQ, oProduct.Lgnum));
                    }
                    if (oProduct.Bin !== undefined && oProduct.Bin !== "") {
                        aFilters.push(new Filter("Bin", FilterOperator.EQ, oProduct.Bin));
                    }
                }
                return aFilters;
            },
    

            /***************************/
            /*****  SERIAL NUMBER ******/
            /***************************/
            
            onPressSN: function (oEvent) {
                this.getRouter().navTo("SerialNumbers", {});
            }

            
        });
    });
