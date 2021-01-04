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
 * @module settings/js/server-widget
 */
define([
    'settings/js/widget',
    'text!settings/templates/server-widget.html'
], function(Widget, template) {

    /**
     * @typedef ServerWidgetStrings
     * @desc Extends WidgetStrings
     * @property {string} validateButton String for the validate button
     */
    /**
     * @typedef ServerWidgetOptions
     * @desc Extends WidgetOptions
     * @property {ServerWidgetStrings} strings Internationalisation strings for the widget
     */
    /**
     * @name module:settings/js/server-widget.ServerWidget
     * @desc Widget for backend servers which require server side validation to check they are alive and are appropriate
     * targets. Provides a test connection button to facilitate this.
     * @param {ServerWidgetOptions} options Options for the Widget
     * @constructor
     * @abstract
     * @extends module:settings/js/widget.Widget
     */
    return Widget.extend(/** @lends module:settings/js/server-widget.ServerWidget.prototype */{
        /**
         * @desc Classes applied to the widget.
         * @type string
         * @default Widget.prototype.className + ' settings-servergroup form-group form-horizontal'
         */
        className: Widget.prototype.className + ' settings-servergroup form-group form-horizontal',

        /**
         * @typedef ServerWidgetTemplateParameters
         * @property {ServerWidgetStrings} strings Strings for the widget
         */
        /**
         * @callback module:settings/js/server-widget.ServerWidget~ServerWidgetTemplate
         * @param {ServerWidgetTemplateParameters} parameters
         */
        /**
         * @desc Base template for the widget.
         * @type module:settings/js/server-widget.ServerWidget~ServerWidgetTemplate
         */
        serverTemplate: _.template(template),

        events: _.extend({
            'click button[name=validate]': 'triggerValidation'
        }, Widget.prototype.events),

        /**
         * @desc Renders the widget by first calling {@link module:settings/js/widget.Widget#render|Widget.render} and
         * then rendering the test connection button
         */
        render: function() {
            Widget.prototype.render.call(this);

            this.$content.append(this.serverTemplate({
                strings: this.strings
            }));

            this.$connectionState = this.$('.connection-state');
        },

        handleInputChange: function() {
            Widget.prototype.handleInputChange.apply(this, arguments);

            if (!_.isUndefined(this.lastValidation) && _.isEqual(this.lastValidationConfig, this.getConfig())) {
                this.setValidationFormatting(this.lastValidation ? this.successClass : this.errorClass);
            }
        },

        /**
         * @desc Handles the results of server side validation
         */
        handleValidation: function(config, response) {
            if (_.isEqual(config, this.lastValidationConfig)) {
                this.lastValidation = response.valid;
                this.hideValidationInfo();

                this.displayValidationMessage(_.isEqual(this.getConfig(), config), response);
            }
        },

        /**
         * @desc If isEqual is true displays a message showing the result of a validation. Otherwise clears the
         * validation state
         * @param {boolean} isEqual True if the config is equal to the config received from the server; false otherwise
         * @param {ValidationResponse} response The repsonse from the server
         * @protected
         */
        displayValidationMessage: function(isEqual, response) {
            if (isEqual) {
                this.setValidationFormatting(this.lastValidation ? this.successClass : this.errorClass);

                var message;

                if (this.lastValidation) {
                    message = this.getValidationSuccessMessage(response);
                }
                else {
                    message = this.getValidationFailureMessage(response);
                }

                this.$connectionState.text(message)
                    .stop()
                    .animate({opacity: 1});
            } else {
                this.setValidationFormatting('clear');
            }
        },

        /**
         * @desc Generates a message indicating that validation was successful
         * @param {ValidationResponse} response The response from the server
         * @returns {string} A message indicating validation was successful
         */
        getValidationSuccessMessage: function() {
            return this.strings.validateSuccess;
        },

        /**
         * @desc Generates a message indicating that validation was unsuccessful
         * @param {ValidationResponse} response The response from the server
         * @returns {string} A message indicating validation was unsuccessful
         */
        getValidationFailureMessage: function(response) {
            return response.data || this.strings.validateFailed;
        },

        /**
         * @desc Removes validation information as defined in Widget and also hides the connection state
         */
        hideValidationInfo: function() {
            Widget.prototype.hideValidationInfo.apply(this, arguments);
            this.$connectionState.text('').css({opacity: 0}).stop();
        },

        /**
         * @desc Returns true as all ServerWidgets should validate
         * @returns {boolean} true
         */
        shouldValidate: function() {
            return true;
        },

        /**
         * @desc Triggers validation when the test connection button is pressed
         * @fires validate Event indicating that validation should take place
         */
        triggerValidation: function() {
            this.setValidationFormatting('clear');
            this.hideValidationInfo();

            if (this.validateInputs()) {
                this.trigger('validate');
            }
        },

        updateConfig: function() {
            Widget.prototype.updateConfig.apply(this, arguments);
            delete this.lastValidation;
            delete this.lastValidationConfig;
        }
    });

});
