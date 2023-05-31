sap.ui.define([], function () {
    "use strict";

    return {

        /**
         * Rounds the number unit value to 2 digits
         * @public
         * @param {string} sValue the number string to be rounded
         * @returns {string} sValue with 2 digits rounded
         */
        getWHDesc : function (sWH) {
            if (!sWH) {
                return "";
            }
            var aWHs = this.oMainModel.getProperty("/query/wHNrs");
            if (aWHs !== undefined && aWHs.length > 0) {
                var wh = aWHs.find(x => x.Whseno == sWH);
                return wh !== undefined ? (sWH + " - " + wh.Whsedesc) : sWH;
            }
            return "";
        }

    };

});