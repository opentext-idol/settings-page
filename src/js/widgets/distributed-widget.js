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

        events: _.extend({
            'change select[name="server-configuration-type"]': function() {
                this.viewState = this.$serverConfigurationType.val();
                this.update();
            }
        }, ServerWidget.prototype.events),

        initialize: function() {
            ServerWidget.prototype.initialize.apply(this, arguments);

            this.dih = {};
            this.dah = {};
            this.standard = {};
        },

        render: function() {
            ServerWidget.prototype.render.call(this);

            this.$('button[name=validate]').parent().before(this.distributedTemplate({
                strings: this.strings
            }));

            this.$serverConfigurationType = this.$('select[name="server-configuration-type"]');

            this.$distributedView = this.$('.distributed-view');
            this.$standardView = this.$('.standard-view');
            this.update();

            this.$('.standard-group').append(this.serverSelectionTemplate({
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

            this.$aciConnectionState = this.$('.aci-error');
            this.$indexingConnectionState = this.$('.indexing-error');
            this.$standardConnectionState = this.$('.standard-error');
        },

        // Class specific functions

        update: function() {
            this.removeMainMessage();
            this.$distributedView.toggleClass('hide', this.viewState !== viewState.distributed);
            this.$standardView.toggleClass('hide', this.viewState === viewState.distributed);
        },

        displayDistributedValidationResult: function($target, result) {
            if(result.validation === 'INCORRECT_SERVER_TYPE') {
                $target.text(this.strings.INCORRECT_SERVER_TYPE(result.friendlyNames.join(', ')));
            } else {
                $target.text(this.strings[result]);
            }

            $target.removeClass('hide');
        },

        distributedError: function(result, $target) {
            if(result) {
                this.displayDistributedValidationResult($target, result.data);
            } else {
                $target.addClass('hide');
            }
        },

        removeMainMessage: function() {
            this.$connectionState.text('').css({opacity: 0}).stop();
        },

        // Overrides

        /**
         * @desc Handles the results of server side validation
         */
        displayValidationMessage: function(isEqual, response) {
            ServerWidget.prototype.displayValidationMessage.apply(this, arguments);

            if (isEqual) {
                this.setValidationFormatting(this.lastValidation ? this.successClass : this.errorClass);

                if(!this.lastValidation) {
                    var data = response.data;

                    if(data) {
                        if(this.lastValidationConfig.distributed) {
                            this.distributedError(data.dihValidationResult, this.$indexingConnectionState);
                            this.distributedError(data.dahValidationResult, this.$aciConnectionState);
                            this.removeMainMessage();
                        } else {
                            this.displayDistributedValidationResult(this.$standardConnectionState, data);
                        }
                    }
                }
            }
        },

        handleInputChange: $.noop,

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

        getValidationFailureMessage: $.noop,

        /**
         * @desc Populates the widget with the given config
         * @param {AciWidgetConfig} config The new config for the widget
         */
        updateConfig: function(config) {
            ServerWidget.prototype.updateConfig.apply(this, arguments);

            var dih = config.dih;
            var dah = config.dah;

            var distributed = config.distributed;

            if(distributed) {
                this.$serverConfigurationType.val(viewState.distributed);
                this.viewState = viewState.distributed;
            } else {
                this.$serverConfigurationType.val(viewState.standard);
                this.viewState = viewState.standard;
            }

            this.update();

            this.$indexingHost.val(dih.host);
            this.$indexingAciPort.val(dih.port);
            this.$indexingProtocol.val(dih.protocol);

            this.$aciHost.val(dah.host);
            this.$aciPort.val(dah.port);
            this.$aciProtocol.val(dah.protocol);

            var standard = config.standard;

            this.$host.val(standard.host);
            this.$port.val(standard.port);
            this.$protocol.val(standard.protocol);

            this.dih = _.pick(dih, 'productType', 'indexErrorMessage');
            this.dah = _.pick(dah, 'productType', 'indexErrorMessage');
            this.standard = _.pick(standard, 'productType', 'indexErrorMessage');
        },

        methods: {
            distributed: {
                getConfig: function() {
                    //noinspection JSValidateTypes
                    return {
                        distributed: true,
                        dih: {
                            host: this.$indexingHost.val(),
                            port: Number(this.$indexingAciPort.val()),
                            protocol: this.$indexingProtocol.val(),

                            productType: this.dih.productType,
                            indexErrorMessage: this.dih.indexErrorMessage
                        },
                        dah: {
                            host: this.$aciHost.val(),
                            port: Number(this.$aciPort.val()),
                            protocol: this.$aciProtocol.val(),

                            productType: this.dah.productType,
                            indexErrorMessage: this.dah.indexErrorMessage
                        }

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
                        distributed: false,
                        standard: {
                            host: this.$host.val(),
                            port: Number(this.$port.val()),
                            protocol: this.$protocol.val(),

                            productType: this.standard.productType,
                            indexErrorMessage: this.standard.indexErrorMessage
                        }
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