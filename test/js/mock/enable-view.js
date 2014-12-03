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
