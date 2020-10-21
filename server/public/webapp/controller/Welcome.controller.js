sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("aws.LightningStorage.controller.Welcome", {
      onInit: function () {
        this._oRouter = this.getOwnerComponent().getRouter();
        var access_token = new URLSearchParams(window.location.hash).get(
          "access_token"
        );
        if (access_token || window.sessionStorage.accessToken) {
          window.sessionStorage.accessToken = access_token
            ? access_token
            : window.sessionStorage.accessToken;
          this._oRouter.navTo("welcome", {}, true);
        } else {
          // window.sessionStorage.accessToken = "";
        }
      },
      handleCognito: function () {
        var sUrl =
          "https://mylightningstorage.auth.ap-south-1.amazoncognito.com/login?client_id=4khht0k2e1r2k5v3ei7hsp8smd&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http://localhost:3000";
        sap.m.URLHelper.redirect(sUrl, false);
      },
    });
  }
);
