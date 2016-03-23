/*
 * Copyright 2013-2016 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

/**
 * @module settings/js/widgets/view-widget
 */
define([
    'app/page/settings/aci-widget',
    'text!templates/app/page/settings/view-widget.html'
], function(AciWidget, template) {
    /**
     * @typedef ViewWidgetStrings
     * @desc Extends AciWidgetStrings
     * @property {string} referenceFieldLabel The label of the reference field dropdown
     * @property {string} referenceFieldBlank The error message to display when the reference field is blank
     * @property {string} referenceFieldPlaceholder Placeholder for the reference field input
     * @property {string} connector Label for the connector section
     * @property {string} viewingMode Label for the viewing mode dropdown
     */
    /**
     * @typedef ViewWidgetOptions
     * @desc Extends AciWidgetOptions
     * @property {ViewWidgetStrings} strings Strings for the widget
     */
    /**
     * @name module:settings/js/widgets/view-widget.ViewWidget
     * @desc Widget for configuring a View server
     * @constructor
     * @extends module:settings/js/widgets/aci-widget.AciWidget
     */
    return AciWidget.extend({

        /**
         * @typedef ViewWidgetTemplateParameters
         * @property {ViewWidgetStrings} strings Strings for the template
         */
        /**
         * @callback module:settings/js/widgets/view-widget.ViewWidget~ViewTemplate
         * @param {ViewWidgetTemplateParameters} parameters
         */
        /**
         * @desc Base template for the widget. Override if using Bootstrap 3
         * @type module:settings/js/widgets/view-widget.ViewWidget~ViewTemplate
         */
        viewTemplate: _.template(template),

        /**
         * @desc Renders the widget
         */
        render: function() {
            AciWidget.prototype.render.call(this);

            this.$('button[name="validate"]').parent().before(this.viewTemplate({
                strings: this.strings
            }));

            this.$('.connector-container').append(this.aciTemplate({
                strings: this.strings
            }));

            this.$modeSelect = this.$('.viewing-mode-input');

            this.$referenceField = this.$('[name="referenceField"]');

            // make sure we don't get the ones for connectors
            this.$host = this.$('input[name=host]').eq(0);
            this.$port = this.$('input[name=port]').eq(0);
            this.$protocol = this.$('select[name=protocol]').eq(0);

            this.$connectorHost = this.$('.connector-container input[name=host]');
            this.$connectorPort = this.$('.connector-container input[name=port]');
            this.$connectorProtocol = this.$('.connector-container select[name=protocol]');

            var toggleInputs = _.bind(function () {
                this.$('.connector-container').toggle(this.$modeSelect.val() === 'CONNECTOR');
                this.$('.field-form-group').toggle(this.$modeSelect.val() === 'FIELD');
            }, this);

            this.$modeSelect.on('input', toggleInputs);

            toggleInputs();
        },

        /**
         * @desc Updates the widget with new configuration
         * @param config The new config for the wizard
         */
        updateConfig: function(config) {
            AciWidget.prototype.updateConfig.apply(this, arguments);

            this.$modeSelect.val(config.viewingMode);
            this.$referenceField.val(config.referenceField);

            this.$connectorHost.val(config.connector.host);
            this.$connectorPort.val(config.connector.port);
            this.$connectorProtocol.val(config.connector.protocol);

            this.productTypeRegex = config.connector.productTypeRegex;
        },

        /**
         * @desc Returns the configuration for the widget
         * @returns The configuration for the widget
         */
        getConfig: function() {
            var config = AciWidget.prototype.getConfig.call(this);

            return _.extend({
                referenceField: this.$referenceField.val(),
                viewingMode: this.$modeSelect.val(),
                connector: {
                    host: this.$connectorHost.val(),
                    port: this.$connectorPort.val(),
                    productTypeRegex: this.productTypeRegex,
                    protocol: this.$connectorProtocol.val()
                }
            }, config);
        },

        /**
         * @desc Handles the results of server side validation
         */
        handleValidation: function(config, response) {
            if (_.isEqual(config, this.lastValidationConfig)) {
                if (response.data && response.data.validation === 'CONNECTOR_VALIDATION_ERROR') {
                    this.updateInputValidation(this.$('.connector-container .form-group'), false, this.getValidationFailureMessage(response.data.connectorValidation))
                }
                else if(response.data === "REFERENCE_FIELD_BLANK") {
                    this.updateInputValidation(this.$referenceField, false, this.strings.referenceFieldBlank);
                }
                else {
                    AciWidget.prototype.handleValidation.apply(this, arguments);
                }
            }
        },

        /**
         * @desc Validates the widget and applies formatting appropriately
         * @returns {boolean} False if
         * <ul>
         * <li> Viewing mode is Reference, and the reference field is blank
         * <li> Viewing mode is connector, and the connector host is blank or the port number is invalid
         * <li> The view server settings are invalid
         * </ul>
         */
        validateInputs: function() {
            var isValid = AciWidget.prototype.validateInputs.apply(this, arguments);

            if (isValid) {
                var mode = this.$modeSelect.val();

                if (mode === 'FIELD') {
                    if (this.$referenceField.val() === '') {
                        this.updateInputValidation(this.$referenceField, false);
                        return false;
                    }
                }
                else if (mode === 'CONNECTOR') {
                    if (this.$connectorHost.val() === '') {
                        this.updateInputValidation(this.$connectorHost, false, this.strings.validateHostBlank);
                        return false;
                    }

                    var port = Number(this.$connectorPort.val());

                    if (port <= 0 || port > 65535) {
                        this.updateInputValidation(this.$connectorPort, false, this.strings.validatePortInvalid);
                        return false;
                    }

                    return true;
                }
            }

            return isValid;
        }
    });

});