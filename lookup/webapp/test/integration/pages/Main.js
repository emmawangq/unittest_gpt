sap.ui.define([
	"sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/BindingPath",
    "sap/ui/test/actions/EnterText"
], function (Opa5, Press, BindingPath, EnterText) {
	"use strict";
	var sViewName = "Main";
	Opa5.createPageObjects({
		onTheAppPage: {

            actions: {
                iPressWarehouse: function () {
                   return this.waitFor({
                       viewName : "Main",
                       id: "miWarehouse",
                       controlType: "sap.m.MultiInput",
                       actions: [
                           new Press()
                       ],
                       errorMessage: "Did not find miWarehouse on the Main page"
                   });
               },

               iSelectWarehouse1710: function () {
                    return this.waitFor({
                        controlType: "sap.m.StandardListItem",
                        matchers: new BindingPath({
                            modelName: "MainModel",
                            path: "/allWarehouse/7"
                        }),
                        success: function (aItems) {
                            aItems[0].setSelected(true);
                          
                            var oSelectButton = null;
                            this.waitFor({
                                searchOpenDialogs : true,
                                controlType : "sap.m.Button",
                                check : function (aButtons) {
                                    return aButtons.filter(function (oButton) {
                                        if(oButton.getText() !== "Select") {
                                            return false;
                                        }
            
                                        oSelectButton = oButton;
                                        return true;
                                    });
                                },
                                success : function () {
                                    oSelectButton.$().trigger("tap");
                                },
                                errorMessage : "Did not find the Select button"
                            });
                        },
                        errorMessage: "Did not find Warehouse 1710"
                    });
                },

                iEnterBarcodeInBin: function () {
                    return this.waitFor({
                        viewName : "Main",
                        id: "inpBin",
                        controlType: "sap.m.Input",
                        actions: [
							new EnterText({
								text: "EWMS4-SERIAL-B;;FIX-BIN-01",
                                pressEnterKey: true
							}),
						],
                        errorMessage: "Did not find inpBin on the Main page"
                    });
                },

           },

			assertions: {

                iShouldSeeWarehousePopupp: function () {
					return this.waitFor({
                        viewName : "Main",
                        id: "warehouseDialog",
						controlType: "sap.m.SelectDialog",
						success: function () {
							Opa5.assert.ok(true, "The warehouseDialog is visible");
						},
						errorMessage: "Didn't find Input warehouseDialog on the page"
					});
				},

                iShouldSeeWarehouse1710Selected: function () {
					return this.waitFor({
                        viewName : "Main",
                        id: "miWarehouse",
						controlType: "sap.m.MultiInput",
						success: function (mi) {
                            Opa5.assert.strictEqual(mi.getTokens()[0].getText(), "1710");
						},
						errorMessage: "Didn't find Input warehouseDialog on the page"
					});
				},

                iShouldOnlySeeBin: function () {
					return this.waitFor({
                        viewName : "Main",
                        id: "inpBin",
						controlType: "sap.m.Input",
						success: function (oInput) {
                            Opa5.assert.strictEqual(oInput.getValue(), "FIX-BIN-01");
						},
						errorMessage: "Didn't find Input warehouseDialog on the page"
					});
				},

				iShouldSeeTheApp: function () {
					return this.waitFor({
						id: "app",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The " + sViewName + " view is displayed");
						},
						errorMessage: "Did not find the " + sViewName + " view"
					});
				}
			}
		}
	});

});
