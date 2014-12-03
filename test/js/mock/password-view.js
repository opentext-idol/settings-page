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
