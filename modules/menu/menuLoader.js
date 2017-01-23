define(function (require) {

    var MenuTemplate = require("text!modules/menu/template.html"),
        MenuLoader;

    MenuLoader = function () {
        var channel = Radio.channel("MenuLoader"),
            ListViewLight = require("modules/menu/desktop/listViewLight"),
            ListView = require("modules/menu/desktop/listView"),
            ListViewMobile = require("modules/menu/mobile/listView");

        // Bootstrap Navigation wird an den Wrapper gehängt
        // $("#lgv-container").prepend(_.template(MenuTemplate));
        this.treeType = Radio.request("Parser", "getTreeType");
        this.getMenuView = function () {
            var isMobile = Radio.request("Util", "isViewMobile"),
                currentMenu;

            // Bootstrap Navigation wird an den Wrapper gehängt
            $("#lgv-container").prepend(_.template(MenuTemplate));
            if (isMobile) {
                currentMenu = new ListViewMobile();
            }
            else {
                if (this.treeType === "light") {
                    currentMenu = new ListViewLight();
                }
                else {
                    currentMenu = new ListView();
                }
            }
            channel.trigger("ready");
            return currentMenu;
        };
        this.currentMenu = this.getMenuView();
        Radio.on("Util", {
            "isViewMobileChanged": function () {
                this.currentMenu.removeView();

                this.currentMenu = this.getMenuView();
            }
        }, this);
    };

    return MenuLoader;
});
