/*
 * (c) Copyright 2016 Micro Focus or one of its affiliates.
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
 define([
    'backbone',
    'underscore',
    'settings/js/widgets/aci-widget',
    'settings/js/controls/enable-view',
    'settings/js/controls/aci-widget-dropdown-view'
], function (Backbone, _, AciWidget, EnableView, DropdownView) {

    return AciWidget.extend({
        DropdownView: DropdownView,
        EnableView: EnableView,
        
        initialize: function (options) {
            //noinspection JSUnresolvedVariable
            AciWidget.prototype.initialize.apply(this, arguments);

            //noinspection JSUnresolvedFunction
            _.bindAll(this, 'answerServerHasChanged', 'getAnswerServer');

            this.enableView = new this.EnableView({
                enableIcon: 'fa fa-file',
                strings: this.strings
            });

            //noinspection JSUnresolvedFunction
            this.listenTo(this.enableView, 'change', function () {
                //noinspection JSUnresolvedFunction
                this.$('.settings-required-flag').toggleClass('hide', !this.enableView.getConfig());
            });

            this.dropdownView = new this.DropdownView({
                url: options.systemNamesUrl,
                property: 'systemNames',
                label: this.strings.systemNameLabel,
                fetchMessage: this.strings.fetchSystemNames,
                invalidMessage: this.strings.invalidSystemName,
                template: options.template,
                hasChanged: this.answerServerHasChanged
            });
        },

        render: function () {
            //noinspection JSUnresolvedVariable
            AciWidget.prototype.render.apply(this, arguments);

            //noinspection JSUnresolvedFunction
            var $validateButtonParent = this.$('button[name=validate]');

            //noinspection JSUnresolvedVariable
            $validateButtonParent.parent().before(this.enableView.$el);
            this.enableView.render();
            $validateButtonParent.parent().before(this.dropdownView.$el);
            this.dropdownView.render();
            
            //noinspection JSUnresolvedFunction
            this.$aciDetails = this.$('div.' + this.controlGroupClass).eq(0);
        },

        /**
         * @returns {boolean} True if the configuration has changed since the widget was last saved; false otherwise
         */
        answerServerHasChanged: function () {
            //noinspection JSUnresolvedVariable,JSUnresolvedFunction
            return !_.isEqual(this.getAnswerServer(), this.lastValidationConfig.server);
        },

        /**
         * @returns The configuration of the Community server
         */
        getAnswerServer: function () {
            //noinspection JSUnresolvedVariable
            return AciWidget.prototype.getConfig.call(this);
        },

        getConfig: function () {
            return {
                server: this.getAnswerServer(),
                systemName: this.dropdownView.getConfig(),
                enabled: this.enableView.getConfig()
            };
        },

        handleInputChange: function() {
            //noinspection JSUnresolvedFunction
            this.hideValidationInfo();

            //noinspection JSUnresolvedFunction
            if (!_.isUndefined(this.lastValidation) && !this.answerServerHasChanged()) {
                this.setValidationFormatting(this.lastValidation ? this.successClass : this.errorClass);
                this.dropdownView.toggleInput(this.lastValidation && this.dropdownView.hasValues());
            } else {
                this.setValidationFormatting('clear');
                this.dropdownView.toggleInput(false);
            }
        },

        /**
         * @desc Handles the results of server side validation. Fetches new system names if the config is valid
         */
        handleValidation: function (config, response) {
            //noinspection JSUnresolvedFunction,JSUnresolvedVariable
            if (_.isEqual(config.server, this.lastValidationConfig.server)) {
                this.lastValidation = response.valid;
                this.lastValidation && this.dropdownView.fetchNewValues(config.server);
                //noinspection JSUnresolvedFunction
                this.hideValidationInfo();

                this.displayValidationMessage(!this.answerServerHasChanged(), response);
            }
        },

        /**
         * @desc Sets the validation formatting to the given state
         * @param {string} state If 'clear', removes validation formatting. Otherwise should be one of this.successClass
         * or this.errorClass, and will set the formatting accordingly
         */
        setValidationFormatting: function (state) {
            if (state === 'clear') {
                this.$aciDetails.removeClass(this.successClass + ' ' + this.errorClass);
                this.dropdownView.clearValidationFormatting(this.errorClass);
            } else {
                this.$aciDetails.addClass(state)
                    .removeClass(state === this.successClass ? this.errorClass : this.successClass);
            }
        },

        /**
         * @desc Validation button handler. Tests the connection to the ACI server
         */
        triggerValidation: function() {
            this.setValidationFormatting('clear');
            //noinspection JSUnresolvedFunction
            this.hideValidationInfo();

            //noinspection JSUnresolvedVariable
            if (AciWidget.prototype.validateInputs.apply(this, arguments)) {
                //noinspection JSUnresolvedFunction
                this.trigger('validate');
            }
        },

        updateConfig: function (config) {
            //noinspection JSUnresolvedVariable
            AciWidget.prototype.updateConfig.call(this, config.server);

            this.enableView.updateConfig(config.enabled);
            this.dropdownView.updateConfig(config.systemName);
        },

        shouldValidate: function () {
            return this.enableView.getConfig();
        },

        validateInputs: function () {
            var isValid = true;

            if (this.shouldValidate()) {
                //noinspection JSUnresolvedVariable
                isValid = AciWidget.prototype.validateInputs.call(this);
            }

            return isValid;
        }
    });
});
