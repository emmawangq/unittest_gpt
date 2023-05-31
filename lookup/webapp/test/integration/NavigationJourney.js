/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/Main"
], function (opaTest) {
	"use strict";

	QUnit.module("Navigation Journey");

    // opaTest("Should see the warehouse dialog when clicking warehouse", function (Given, When, Then) {
	// 	// Arrangements
	// 	Given.iStartMyApp();

    //     //Actions
    //     When.onTheAppPage.iPressWarehouse();

	// 	// Assertions
	// 	Then.onTheAppPage.iShouldSeeWarehousePopupp();

	// 	//Cleanup
	// 	Then.iTeardownMyApp();
	// });

    opaTest("Should be able select a warehouse", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

        //Actions
        When.onTheAppPage.iPressWarehouse();
        When.onTheAppPage.iSelectWarehouse1710();

		// Assertions
		Then.onTheAppPage.iShouldSeeWarehouse1710Selected();

		//Cleanup
		Then.iTeardownMyApp();
	});

    opaTest("Should only see bin when enter barcode in bin", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

        //Actions
        When.onTheAppPage.iEnterBarcodeInBin();

		// Assertions
		Then.onTheAppPage.iShouldOnlySeeBin();

		//Cleanup
		Then.iTeardownMyApp();
	});
});
