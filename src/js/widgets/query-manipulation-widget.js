/*
 * Copyright 2014-2016 Open Text.
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

define([
    'underscore',
    'settings/js/widgets/aci-widget',
    'settings/js/controls/enable-view',
    'text!settings/templates/widgets/query-manipulation-widget.html'
], function(_, AciWidget, EnableView, queryManipulationTemplate) {

    return AciWidget.extend({
        EnableView: EnableView,
        queryManipulationTemplate: _.template(queryManipulationTemplate),

        initialize: function() {
            AciWidget.prototype.initialize.apply(this, arguments);

            this.enableView = new this.EnableView({
                enableIcon: 'fa fa-file',
                strings: this.strings
            });

            this.listenTo(this.enableView, 'change', function() {
                this.$('.settings-required-flag').toggleClass('hide', !this.enableView.getConfig());
            });
        },

        render: function() {
            AciWidget.prototype.render.apply(this, arguments);

            var $validateButtonParent = this.$('button[name=validate]').parent();

            $validateButtonParent.before(this.queryManipulationTemplate({
                strings: this.strings
            }));

            this.$typeahead = this.$('.typeahead-input');

            this.enableView.render();
            $validateButtonParent.before(this.enableView.el);
        },

        getConfig: function() {
            return {
                enabled: this.enableView.getConfig(),
                server: AciWidget.prototype.getConfig.call(this),
                typeAheadMode: this.$typeahead.val()
            };
        },

        updateConfig: function(config) {
            AciWidget.prototype.updateConfig.call(this, config.server);

            this.$typeahead.val(config.typeAheadMode);
            this.enableView.updateConfig(config.enabled);
        },

        validateInputs: function() {
            return !this.enableView.getConfig() || AciWidget.prototype.validateInputs.call(this);
        },

        shouldValidate: function() {
            return this.enableView.getConfig();
        }
    });

});
