/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'backbone'
], function(Backbone) {

    return Backbone.View.extend({
        initialize: function(options) {
            this.enabled = _.isUndefined(options.enabled) ? true : options.enabled;
        },

        render: $.noop,
        getConfig: $.noop,

        setEnabled: function(state) {
            this.enabled = state;
        },

        updateConfig: $.noop,

        validateInputs: function() {
            return true;
        }
    });

});
