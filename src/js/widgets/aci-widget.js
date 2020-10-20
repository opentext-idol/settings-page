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
 * @module settings/js/widgets/aci-widget
 */
define([
    'settings/js/server-widget',
    'text!settings/templates/widgets/aci-widget.html'
], function(ServerWidget, template) {

    /**
     * @typedef AciWidgetStrings
     * @desc Extends ServerWidgetStrings
     * @property {string} validateHostBlank String which indicates that the entered host is blank
     * @property {string} validatePortInvalid String which indicates that the entered port is blank, or is &lt;= 0 or
     * &gt; 65535
     */
    /**
     * @typedef AciWidgetOptions
     * @desc Extends ServerWidgetOptions
     * @property strings {AciWidgetStrings} Strings for the widget
     */
    /**
     * @name module:settings/js/widgets/aci-widget.AciWidget
     * @desc Widget representing the configuration of an ACI server
     * @constructor
     * @param {AciWidgetOptions} options Options for the widget
     * @extends module:settings/js/server-widget.ServerWidget
     */
    return ServerWidget.extend(/** @lends module:settings/js/widgets/aci-widget.AciWidget.prototype */{

        /**
         * @typedef AciWidgetTemplateParameters
         * @property {AciWidgetStrings} strings Strings for the widget
         */
        /**
         * @callback module:settings/js/widgets/aci-widget.AciWidget~AciTemplate
         * @param {AciWidgetTemplateParameters} parameters
         */
        /**
         * @desc Base template for the widget. Override if using Bootstrap 3
         * @type module:settings/js/widgets/aci-widget.AciWidget~AciTemplate
         */
        aciTemplate: _.template(template),

        /**
         * @desc Renders the widget by first calling {@link module:settings/js/server-widget.ServerWidget#render|ServerWidget#render}
         * and then adding the necessary form controls
         */
        render: function() {
            ServerWidget.prototype.render.call(this);

            this.$('button[name=validate]').parent().before(this.aciTemplate({
                strings: this.strings
            }));

            this.$host = this.$('input[name=host]');
            this.$port = this.$('input[name=port]');
            this.$protocol = this.$('select[name=protocol]');
        },

        /**
         * @typedef AciWidgetConfig
         * @property {string} host The host the server is located on
         * @property {number} port The ACI port of the server
         * @property {string} protocol The protocol used to communicate with the server (http or https)
         * @property {string} productType The expected ProductTypeCSV of the server
         * @property {string} [indexErrorMessage] The error message to expect when running a test index command. May be
         * missing if the ACI server type does not have an index port
         */
        /**
         * @desc Returns the configuration associated with this widget
         * @returns {AciWidgetConfig} The current configuration represented by the widget
         */
        getConfig: function() {
            //noinspection JSValidateTypes
            return {
                host: this.$host.val(),
                port: Number(this.$port.val()),
                protocol: this.$protocol.val(),
                productType: this.productType,
                indexErrorMessage: this.indexErrorMessage
            };
        },

        /**
         * @desc Populates the widget with the given config
         * @param {AciWidgetConfig} config The new config for the widget
         */
        updateConfig: function(config) {
            ServerWidget.prototype.updateConfig.apply(this, arguments);

            this.$host.val(config.host);
            this.$port.val(config.port);
            this.$protocol.val(config.protocol);
            this.productType = config.productType;
            this.indexErrorMessage = config.indexErrorMessage;
        },

        /**
         * @desc Validates the widget and applies formatting if necessary
         * @returns {boolean} False if the host is blank; true otherwise
         */
        validateInputs: function() {
            if (this.$host.val() === '') {
                this.updateInputValidation(this.$host, false, this.strings.validateHostBlank);
                return false;
            }

            var port = Number(this.$port.val());

            if (port <= 0 || port > 65535) {
                this.updateInputValidation(this.$port, false, this.strings.validatePortInvalid);
                return false;
            }

            return true;
        },

        /**
         * @desc Updates the formatting of the given input
         * <p> If isValid is true, removes errorClass from the input and hides elements with the class
         * settings-client-validation
         * <p> If isValid is false, adds errorClass to the input and shows elements with the class
         * settings-client-validation
         * @param {jQuery} $input The input to apply the classes to
         * @param {boolean} isValid True if the input is valid; false otherwise
         * @param {string} message Validation message to display
         * @protected
         */
        updateInputValidation: function($input, isValid, message) {
            this.$('.settings-client-validation').text(message);

            ServerWidget.prototype.updateInputValidation.call(this, $input, isValid)
        },

        getValidationFailureMessage: function(response) {
            var data = response.data;

            if(data) {
                if(data.validation === 'INCORRECT_SERVER_TYPE') {
                    return this.strings.INCORRECT_SERVER_TYPE(data.friendlyNames.join(', '));
                } else {
                    return this.strings[data];
                }
            } else {
                return ServerWidget.prototype.getValidationFailureMessage.call(this, response);
            }
        }
    });

});
