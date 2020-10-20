sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
  ],
  function (Controller, JSONModel, MessageToast, Fragment) {
    "use strict";

    return Controller.extend("aws.LightningStorage.controller.Main", {
      onInit: function () {
        this._oView = this.getView();
        var oMainModel = new JSONModel({
          busy: true,
          busyUpload: false,
          delay: 0,
          items: [],
        });
        this._oView.setModel(oMainModel, "mainModel");
        this._oRouter = this.getOwnerComponent().getRouter();
        this._oRouter
          .getRoute("welcome")
          .attachPatternMatched(this._onRouteMatched, this);
        // var sUserId = "s.s@gmail.com";
        // url: "/api/read_files?user_id=" + sUserId,
        if (window.sessionStorage.accessToken) {
          $.ajax({
            type: "GET",
            headers: {
              Authorization: `Bearer ${window.sessionStorage.accessToken}`,
            },
            contentType: "application/json",
            url: "/api/read_files",
            dataType: "json",
            success: function (data) {
              this._oView
                .getModel("mainModel")
                .setProperty("/items", data.items);
              this._oView.getModel("mainModel").setProperty("/name", data.name);
              this._oView
                .getModel("mainModel")
                .setProperty("/user_id", data.user_id);
              this._oView.getModel("mainModel").setProperty("/busy", false);
            }.bind(this),
            error: function (error) {
              MessageToast.show("Error occured. Sign in again");
              this._oView.getModel("mainModel").setProperty("/busy", false);
              console.log("Error fetching files");
              // var sUrl =
              //   "https://mylightningstorage.auth.ap-south-1.amazoncognito.com/login?client_id=4khht0k2e1r2k5v3ei7hsp8smd&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http://localhost:3000";
              // sap.m.URLHelper.redirect(sUrl, false);
            }.bind(this),
          });
        } else {
          // var sUrl =
          //   "https://mylightningstorage.auth.ap-south-1.amazoncognito.com/login?client_id=4khht0k2e1r2k5v3ei7hsp8smd&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http://localhost:3000";
          // sap.m.URLHelper.redirect(sUrl, false);
        }
      },
      _onRouteMatched: function () {},
      handleUploadPress: function (oEvent) {
        var oFileUploader = this._oView.byId("fileUploader"),
          oFile = oFileUploader.oFileUpload.files[0],
          oMainModel = this.getView().getModel("mainModel");
        if (oFile) {
          // var oUploadSet = this._oView.byId("UploadCollection"),
          // aUploadCollectionItems = oUploadSet.getItems(),

          var aItems = oMainModel.getProperty("/items"),
            sMode = "POST",
            sUrl = "/api/upload_file",
            sFileName = "",
            currIndx = -1,
            prevUTime = "";
          jQuery.each(
            aItems,
            function (index) {
              var sCurrFileName = this.formatFilename(aItems[index].filename);
              if (aItems[index] && sCurrFileName === oFile.name) {
                sFileName = aItems[index].filename;
                sMode = "PUT";
                sUrl = "/api/update_file";
                currIndx = index;
                prevUTime = aItems[index].utime;
              }
            }.bind(this)
          );
          oMainModel.setProperty("/busyUpload", true);
          var formData = new FormData();
          if (sMode === "PUT") {
            formData.append("filename", sFileName);
            formData.append("utime", prevUTime);
          } else {
            formData.append("utime", Date.now().toString());
          }
          // formData.append("fname", "Shivam");
          // formData.append("lname", "Shrivastav");
          // formData.append("utime", Date.now().toString());
          formData.append("fileToUpload", oFile, oFile.name);
          // formData.append("user_id", "s.s@gmail.com");
          formData.append("ctime", Date.now().toString());
          formData.append(
            "description",
            oMainModel.getProperty("/description")
          );
          var params = {
            url: sUrl,
            timeout: 0,
            headers: {
              Authorization: `Bearer ${window.sessionStorage.accessToken}`,
            },
            processData: false,
            method: sMode,
            mimeType: "multipart/form-data",
            contentType: false,
            data: formData,
          };

          $.ajax(params).done(function (response, success) {
            if (success === "success") {
              var aItems = oMainModel.getProperty("/items");
              aItems.splice(currIndx, 1);
              aItems.unshift(JSON.parse(response));
              oMainModel.setProperty("/item", aItems);
              oMainModel.setProperty("/description", "");
              oFileUploader.setValue(null);
              MessageToast.show(
                "File " +
                  (sMode === "POST" ? "uploaded" : "updated") +
                  " successfully"
              );
            }
            oMainModel.setProperty("/busyUpload", false);
          });
        } else {
          MessageToast.show("Please choose a file to uploaded");
        }
      },
      onFileDeleted: function (oEvent) {
        var sDocId = oEvent.getParameter("documentId"),
          oMainModel = this._oView.getModel("mainModel"),
          aItems = oMainModel.getProperty("/items");

        // var sUserId = "s.s@gmail.com";
        var data = {
          // user_id: sUserId,
          filename: oEvent.getParameter("documentId"),
        };
        oMainModel.setProperty("/busyDelete", true);
        $.ajax({
          type: "DELETE",
          headers: {
            Authorization: `Bearer ${window.sessionStorage.accessToken}`,
          },
          contentType: "application/json",
          url: "/api/delete_file",
          dataType: "json",
          data: JSON.stringify(data),
          success: function (data) {
            jQuery.each(aItems, function (index) {
              if (aItems[index] && aItems[index].filename === sDocId) {
                aItems.splice(index, 1);
              }
            });
            oMainModel.setProperty("/items", aItems);
            oMainModel.setProperty("/busyDelete", false);
            MessageToast.show("File deleted successfully");
          }.bind(this),
          error: function (error) {
            oMainModel.setProperty("/busyDelete", false);
            console.log("Error fetching files");
          }.bind(this),
        });
      },
      onFileSizeExceed: function (oEvent) {
        MessageToast.show("Max. 10 MB size allowed");
      },
      onAvatarPressed: function (oEvent) {
        var oAvatar = oEvent.getSource();
        if (!this._oMenu) {
          Fragment.load({
            name: "aws.LightningStorage.view.Avatar",
            controller: this,
          }).then(
            function (oPopover) {
              this._oMenu = oPopover;
              var sCompactCozyClass = this.getOwnerComponent().getContentDensityClass();
              jQuery.sap.syncStyleClass(
                sCompactCozyClass,
                this._oView,
                oPopover
              );
              this._oView.addDependent(this._oMenu);
              this._oMenu.setModel(this._oView.getModel("mainModel"));
              this._oMenu.openBy(oAvatar);
            }.bind(this)
          );
        } else {
          this._oMenu.openBy(oAvatar);
        }
      },
      onLogoutPress: function () {
        window.sessionStorage.accessToken = "";
        HashChanger.getInstance().replaceHash("");
      },
      formatFilename: function (fileName) {
        var sFileName = fileName;
        if (fileName) {
          var strtInx = fileName.indexOf("-");
          sFileName = fileName.substr(strtInx + 1);
        }
        return sFileName;
      },
      formatTime: function (time) {
        var sTimestamp = "";
        if (time) {
          var timestamp = parseInt(time),
            oDate = new Date(timestamp);
          sTimestamp = oDate.toDateString() + " " + oDate.toLocaleTimeString();
        }
        return sTimestamp;
      },
      formatSize: function (size) {
        var sSize = "";
        if (size) {
          var fileSizeExt = ["Bytes", "KB", "MB", "GB"],
            i = 0;
          while (size > 900) {
            size /= 1024;
            i++;
          }
          sSize = Math.round(size * 100) / 100 + " " + fileSizeExt[i];
        }
        return sSize;
      },
    });
  }
);
