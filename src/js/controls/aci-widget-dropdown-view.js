/*
 * (c) Copyright 2013-2015 Micro Focus or one of its affiliates.
 *
 * Licensed under the MIT License (the "License"); you may not use this file
 * except in compliance with the License.
 *
 * The only warranties for products and services of Micro Focus and its affiliates
 * and licensors ("Micro Focus") are as may be set forth in the express warranty
 * statements accompanying such products and services. Nothing herein should be
 * construed as constituting an additional warranty. Micro Focus shall not be
 * liable for technical or editorial errors or omissions contained herein. The
 * information contained herein is subject to change without notice.
 */

/**
 * @module settings/js/controls/enable-view
 */
define([
    'backbone',
    'underscore',
    'settings/js/models/dropdown-property-model',
    'text!settings/templates/controls/aci-widget-dropdown-view.html'
], function (Backbone, _, DropdownPropertyModel, dropdownTemplate) {
    return Backbone.View.extend({
        currentDropdownValue: null,

        initialize: function (options) {
            var Constructor = options.ModelConstructor || DropdownPropertyModel;
            this.model = new Constructor({}, {
                url: options.url
            });

            _.bindAll(this, 'fetchNewValues', 'handleNewValues', 'toggleInput', 'updateDropdown');

            this.property = options.property;

            this.label = options.label;
            this.fetchMessage = options.fetchMessage;
            this.invalidMessage = options.invalidMessage;

            this.exceptionalValues = options.exceptionalValues || [];
            this.hasChanged = options.hasChanged;

            this.template = _.template(options.template || dropdownTemplate);

            this.model.on('change', this.handleNewValues);
        },

        /**
         * @desc Renders the view
         */
        render: function () {
            //noinspection JSUnresolvedVariable
            this.$el.html(this.template({
                label: this.label,
                fetchMessage: this.fetchMessage,
                invalidMessage: this.invalidMessage
            }));
            //noinspection JSUnresolvedFunction
            this.$dropdown = this.$('select[name="aci-widget-dropdown"]');
            //noinspection JSUnresolvedFunction
            this.$valuesSpan = this.$('.fetch-dropdown-values');
        },

        /**
         * @desc Fetches values for the dropdown for the given server
         * @param server
         */
        fetchNewValues: function (server) {
            this.model.unset(this.property, {silent: true});

            this.model.fetch({
                data: {
                    protocol: server.protocol,
                    host: server.host,
                    port: server.port
                }
            });
        },

        hasValues: function () {
            return this.model.get(this.property);
        },

        /**
         * @desc Returns the current state of the view
         * @returns {String} The current value for the dropdown setting
         */
        getConfig: function () {
            return this.$dropdown.val() || this.currentDropdownValue;
        },

        /**
         * @desc Handler for changes in the list of available values
         */
        handleNewValues: function () {
            this.updateDropdown();
            this.toggleInput(!this.hasChanged());
        },

        clearValidationFormatting: function (errorClass) {
            this.$dropdown.parent().removeClass(errorClass);
            this.$valuesSpan.removeClass('hide');
        },

        /**
         * @desc Hides or shows the security types input and corresponding instructions
         * @param {boolean} isEnabled True if dropdown values should be enabled; false otherwise
         */
        toggleInput: function (isEnabled) {
            this.$valuesSpan.toggleClass('hide', isEnabled);
            this.$dropdown.attr('disabled', !isEnabled);
        },

        updateConfig: function (config) {
            this.currentDropdownValue = config;
            this.model.unset(this.property, {silent: true});
            this.toggleInput(false);
            this.updateDropdown();
        },

        /**
         * @desc Updates the dropdown with the values in the model.
         * @protected
         */
        updateDropdown: function () {
            var values = this.model.get(this.property);
            var currentValue = this.$dropdown.val() || this.currentDropdownValue;
            this.$dropdown.empty();

            if (values) {
                if (this.exceptionalValues.some(function (exceptionalValue) {
                        return exceptionalValue === currentValue;
                    })) {
                    // If we are using an exceptional value, append it to the dropdown (e.g. cas/external login type for community)
                    this.$dropdown.append(new Option(currentValue, currentValue, true, true));
                }

                _.each(values, function (value) {
                    this.$dropdown.append(new Option(value, value, false, value === currentValue));
                }, this);

                var currentOption = this.$dropdown.find('[value="' + currentValue + '"]');

                if (currentOption.length) {
                    this.$dropdown.val(currentValue);
                } else {
                    this.$dropdown.val(_.first(values));
                }
            } else if (currentValue) {
                this.$dropdown.append(new Option(currentValue, currentValue, true, true));
            }
        },
        
        getDropdownElement: function () {
            return this.$dropdown;
        }
    });

});
