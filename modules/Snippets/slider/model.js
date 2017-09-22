define(function (require) {

    var SnippetModel = require("modules/Snippets/model"),
        ValueModel = require("modules/Snippets/slider/valueModel"),
        SliderModel;

    SliderModel = SnippetModel.extend({
        initialize: function (attributes) {
            var parsedValues;
            // parent (SnippetModel) initialize
            this.superInitialize();
            parsedValues = this.parseValues(attributes.values);
            // slider range
            /*this.setRangeMinValue(_.min(parsedValues));
            this.setRangeMaxValue(_.max(parsedValues));*/
            this.addValueModels(_.min(parsedValues), _.max(parsedValues));

            /*this.listenToOnce(this, {
                "setRangeOnce": function (parsedValues) {
                    this.setRangeMinValue(_.min(parsedValues));
                    this.setRangeMaxValue(_.max(parsedValues));
                    this.resetValueModels();
                }
            });*/
            this.listenTo(this.get("valuesCollection"), {
                "change:value": function (model, value) {
                    this.triggerValuesChanged(model, value);
                    if (model.get("initValue") === value) {
                        this.trigger("render");
                    }
                }
            });
        },

        /**
         * add minValueModel and maxValueModel to valuesCollection
         */
        addValueModels: function (min, max) {
            this.get("valuesCollection").add([
                new ValueModel({
                    attr: this.get("name"),
                    displayName: this.get("displayName") + " ab",
                    value: min,
                    type: this.get("type"),
                    isMin: true
                }),
                new ValueModel({
                    attr: this.get("name"),
                    displayName: this.get("displayName") + " bis",
                    value: max,
                    type: this.get("type"),
                    isMin: false
                })
            ]);
        },

        /**
         * call the updateValueModel function and/or the updateMaxValueModel
         * trigger the valueChanged event on snippetCollection in queryModel
         * @param  {number | array} value - depending on slider type
         */
        updateValues: function (snippetValues) {
            // range slider
            if (_.isArray(snippetValues) === true) {
                this.get("valuesCollection").at(0).setValue(snippetValues[0]);
                this.get("valuesCollection").at(1).setValue(snippetValues[1]);
            }
            // slider
            else {
                this.get("valuesCollection").at(0).set("value", snippetValues);
            }
        },

       /* resetValueModels: function () {
            this.resetValueModel(this.get("valuesCollection").at(0));
            this.resetValueModel(this.get("valuesCollection").at(1));
        },*/
        /**
        * If the value model is no longer selected,
        * sets the value to the range value
        * @param  {Backbone.Model} valueModel
        */
       /*
        resetValueModel: function (valueModel) {
            if (valueModel.get("isMin")) {
                valueModel.set("value", this.get("rangeMinValue"));
            }
            else {
                valueModel.set("value", this.get("rangeMaxValue"));
            }
            this.trigger("render");
        },*/

        updateSelectableValues: function (values) {
           /* var parsedValues = this.parseValues(values);

            this.trigger("setRangeOnce", parsedValues);*/
        },

        /**
         * returns an object with the slider name and its values
         * @return {object} - contains the selected values
         */
        getSelectedValues: function () {
            return {
                attrName: this.get("name"),
                type: this.get("type"),
                values: this.get("valuesCollection").pluck("value")
            };
        },

        /**
         * parse strings into numbers if necessary
         * @param  {array} valueList
         * @return {number[]} parsedValueList
         */
        parseValues: function (valueList) {
            var parsedValueList = [];

            _.each(valueList, function (value) {
                if (_.isString(value)) {
                    value = parseInt(value, 10);
                }
                parsedValueList.push(value);
            });

            return parsedValueList;
        },

        /**
         * set the minimum possible value
         * @param  {number} value
         */
/*
        setRangeMinValue: function (value) {
            this.set("rangeMinValue", value);
        },*/

        /**
         * set the maximum possible value
         * @param  {number} value
         */
       /* setRangeMaxValue: function (value) {
            this.set("rangeMaxValue", value);
        }*/
    });

    return SliderModel;
});
