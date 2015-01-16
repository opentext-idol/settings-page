/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'backbone'
], function(Backbone) {

    return Backbone.View.extend({
        initialize: function(options) {},
        render: function() {},
        getConfig: function() {
            return this.enabled;
        },
        updateConfig: function(config) {
            this.enabled = config;
        }
    });

});
