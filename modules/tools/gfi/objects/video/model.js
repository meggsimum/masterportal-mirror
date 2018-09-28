define(function (require) {
    var VideoJs = require("videojs"),
        VideoModel;

    VideoModel = Backbone.Model.extend({
        defaults: {
            id: _.uniqueId("video"),
            url: "",
            type: "",
            width: "400px",
            height: "300px"
        },

        initialize: function (url, type, width, height) {
            this.setUrl(url);
            this.setType(type);
            this.setWidth(width);
            this.setHeight(height);

            this.listenTo(Radio.channel("GFI"), {
                "afterRender": this.startStreaming,
                "isVisible": this.changedGFI
            }, this);
        },

        /**
         * Startet das Streaming
         * @param  {Function} callback Callback-Funktion wird gerufen, nachdem das Video gestaret ist
         * @returns {void}
         */
        startStreaming: function (callback) {
            var videoEle = document.getElementById(this.get("id"));

            VideoJs(videoEle, {"autoplay": true, "preload": "auto", "controls": false}, callback);
        },

        /**
         * Prüft, ob das GFI ausgeschaltet wurde
         * @param  {boolean} value Visibility des GFI
         * @returns {void}
         */
        changedGFI: function (value) {
            if (value === false) {
                this.destroy();
            }
        },

        /**
         * Zerstört das Modul vollständig
         * stop VideoJs
         * remove Radio-Listener
         * remove Backbone-Listener
         * clear Attributes
         * remove View
         * @returns {void}
         */
        destroy: function () {
            var videoEle = document.getElementById(this.get("id"));

            VideoJs(videoEle).dispose();
            this.stopListening();
            this.off();
            this.clear();
            this.trigger("removeView");
        },

        // setter for id
        setId: function (value) {
            this.set("id", value);
        },

        // setter for url
        setUrl: function (value) {
            this.set("url", value);
        },

        // setter for type
        setType: function (value) {
            this.set("type", value);
        },

        // setter for width
        setWidth: function (value) {
            this.set("width", value);
        },

        // setter for height
        setHeight: function (value) {
            this.set("height", value);
        }
    });
    return VideoModel;
});
