/*
 * Copyright 2014-2016 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'settings/js/widgets/aci-widget',
    'settings/js/controls/enable-view',
    'text!settings/templates/widgets/query-manipulation-widget.html'
], function(AciWidget, EnableView, queryManipulationTemplate) {

    return AciWidget.extend({

        queryManipulationTemplate: _.template(queryManipulationTemplate),

        initialize: function() {
            AciWidget.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            AciWidget.prototype.render.apply(this, arguments);

            var $validateButtonParent = this.$('button[name=validate]').parent();

            $validateButtonParent.before(this.queryManipulationTemplate({
                strings: this.strings
            }));

            this.$typeahead = this.$('.typeahead-input');
        },

        getConfig: function() {
            return {
                server: AciWidget.prototype.getConfig.call(this),
                typeAheadMode: this.$typeahead.val()
            }
        },

        updateConfig: function(config) {
            AciWidget.prototype.updateConfig.call(this, config.server);

            this.$typeahead.val(config.typeAheadMode);
        }
    });

});