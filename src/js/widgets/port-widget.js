/*
 * Copyright 2013-2015 Open Text.
 *
 * Licensed under the MIT License (the "License"); you may not use this file
 * except in compliance with the License.
 *
 * The only warranties for products and services of Open Text and its affiliates
 * and licensors ("Open Text") are as may be set forth in the express warranty
 * statements accompanying such products and services. Nothing herein should be
 * construed as constituting an additional warranty. Open Text shall not be
 * liable for technical or editorial errors or omissions contained herein. The
 * information contained herein is subject to change without notice.
 */

/**
 * @module settings/js/widgets/port-widget
 */
define([
    'underscore',
    'settings/js/widget',
    'text!settings/templates/widgets/port-widget.html'
], function(_, Widget, template) {

    /**
     * @typedef PortWidgetStrings
     * @desc Extends WidgetStrings
     * @property {string} label Label for the input
     * @property {string} validatePortBlank Message displayed when the port input is invalid
     */
    /**
     * @typedef PortWidgetOptions
     * @desc Extends WidgetOptions
     * @property {PortWidgetStrings} strings Strings for the widget
     */
    /**
     * @name module:settings/js/widgets/port-widget.PortWidget
     * @desc Widget for configuring a port
     * @param {PortWidgetOptions} options Options for the widget
     * @constructor
     * @extends module:settings/js/widget.Widget
     */
    return Widget.extend(/** @lends module:settings/js/widgets/port-widget.PortWidget.prototype */{
        /**
         * @desc CSS classes for the widget.
         * @default {@link module:settings/js/widget.Widget#className|Widget#className} + ' form-horizontal'
         */
        className: Widget.prototype.className + ' form-horizontal',

        /**
         * @typedef PortWidgetTemplateParameters
         * @property {PortWidgetStrings} strings Strings for the template
         */
        /**
         * @callback module:settings/js/widgets/port-widget.PortWidget~PortTemplate
         * @param {PortWidgetTemplateParameters} parameters
         */
        /**
         * @desc Base template for the widget. Override if using Bootstrap 3
         * @type module:settings/js/widgets/port-widget.PortWidget~PortTemplate
         */
        template: _.template(template),

        /**
         * @desc Renders the widget
         */
        render: function() {
            Widget.prototype.render.call(this);
            this.$content.append(this.template({strings: this.strings}));
            this.$port = this.$('input[name="port"]');
        },

        /**
         * @typedef PortConfig
         * @property {number} port The port represented by the widget
         */
        /**
         * @desc Returns the configuration represented by the widget
         * @returns {PortConfig} The configuration represented by the widget
         */
        getConfig: function() {
            //noinspection JSValidateTypes
            return {
                port: parseInt(this.$port.val(), 10)
            };
        },

        /**
         * Updates the widget with the given config
         * @param config The new configuration for the widget
         */
        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);
            this.$port.val(config.port);
        },

        /**
         * @desc Validates the widget and applies formatting as appropriate
         * @returns {boolean} True if the port is an integer in 1-65535; false otherwise
         */
        validateInputs: function() {
            var port = parseInt(this.$port.val(), 10);

            if (isNaN(port) || port <= 0 || port > 65535) {
                this.updateInputValidation(this.$port, false);
                return false;
            }

            return true;
        }
    });

});
