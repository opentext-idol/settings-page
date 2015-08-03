/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

/**
 * @module settings/js/widgets/aci-widget
 */
define([
    'settings/js/server-widget',
    'text!settings/templates/widgets/server-selection-template.html',
    'text!settings/templates/widgets/distributed-widget.html'
], function(ServerWidget, serverSelectionTemplate, template) {

    var viewState = {
        standard: 'standard',
        distributed: 'distributed'
    };

    return ServerWidget.extend({
        serverSelectionTemplate: _.template(serverSelectionTemplate),
        distributedTemplate: _.template(template),

        render: function() {
            ServerWidget.prototype.render.call(this);

            this.$('button[name=validate]').parent().before(this.distributedTemplate({
                strings: this.strings
            }));

            this.viewState = viewState.standard;

            this.$serverConfigurationType = this.$('select[name="server-configuration-type"]');
            this.$serverConfigurationType.change(_.bind(function() {
                this.viewState = this.$serverConfigurationType.val();
                this.update();
            }, this));

            this.$distributedView = this.$('.distributed-view');
            this.$standardView = this.$('.standard-view');
            this.update();

            this.$standardView.append(this.serverSelectionTemplate({
                strings: this.strings,
                tag: 'standard'
            }));

            this.$distributedView.find('.aci-group').append(this.serverSelectionTemplate({
                strings: this.strings,
                tag: 'aci'
            }));

            this.$distributedView.find('.indexing-group').append(this.serverSelectionTemplate({
                strings: this.strings,
                tag: 'indexing'
            }));

            this.$host = this.$('input[name=standard-host]');
            this.$port = this.$('input[name=standard-port]');
            this.$protocol = this.$('select[name=standard-protocol]');

            this.$aciHost = this.$('input[name=aci-host]');
            this.$aciPort = this.$('input[name=aci-port]');
            this.$aciProtocol = this.$('select[name=aci-protocol]');

            this.$indexingHost = this.$('input[name=indexing-host]');
            this.$indexingAciPort = this.$('input[name=indexing-port]');
            this.$indexingProtocol = this.$('select[name=indexing-protocol]');
        },

        update: function() {
            this.$distributedView.toggleClass('hide', this.viewState !== viewState.distributed);
            this.$standardView.toggleClass('hide', this.viewState === viewState.distributed);
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
        },

        /**
         * @desc Populates the widget with the given config
         * @param {AciWidgetConfig} config The new config for the widget
         */
        updateConfig: function(config) {
            ServerWidget.prototype.updateConfig.apply(this, arguments);

            this.productType = config.productType;
            this.indexErrorMessage = config.indexErrorMessage;

            // Standard
            this.$host.val(config.host);
            this.$port.val(config.port);
            this.$protocol.val(config.protocol);

            // Distributed
            this.$aciHost.val(config.aciHost);
            this.$aciPort.val(config.aciPort);
            this.$aciProtocol.val(config.aciProtocol);

            this.$indexingHost.val(config.indexingHost);
            this.$indexingAciPort.val(config.indexingAciPort);
            this.$indexingProtocol.val(config.indexingProtocol);
        },

        methods: {
            distributed: {
                getConfig: function() {
                    //noinspection JSValidateTypes
                    return {
                        aciHost: this.$aciHost.val(),
                        aciPort: Number(this.$aciPort.val()),
                        aciProtocol: this.$aciProtocol.val(),

                        indexingHost: this.$indexingHost.val(),
                        indexingAciPort: Number(this.$indexingAciPort.val()),
                        indexingProtocol: this.$indexingProtocol.val(),

                        productType: this.productType,
                        indexErrorMessage: this.indexErrorMessage
                    };
                },

                validateInputs: function() {
                    if (this.$aciHost.val() === '') {
                        this.updateInputValidation(this.$aciHost, false, this.strings.validateAciHostBlank);
                        return false;
                    }

                    var aciPort = Number(this.$aciPort.val());

                    if (aciPort <= 0 || aciPort > 65535) {
                        this.updateInputValidation(this.$aciPort, false, this.strings.validateAciPortInvalid);
                        return false;
                    }

                    if (this.$indexingHost.val() === '') {
                        this.updateInputValidation(this.$indexingHost, false, this.strings.validateIndexHostBlank);
                        return false;
                    }

                    var indexPort = Number(this.$indexingAciPort.val());

                    if (indexPort <= 0 || indexPort > 65535) {
                        this.updateInputValidation(this.$indexingAciPort, false, this.strings.validateIndexPortInvalid);
                        return false;
                    }

                    return true;
                }
            },

            standard: {
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
                }
            }
        },

        getConfig: function() {
            return this.methods[this.viewState].getConfig.apply(this, arguments);
        },

        validateInputs: function() {
            return this.methods[this.viewState].validateInputs.apply(this, arguments);
        }
    });

});