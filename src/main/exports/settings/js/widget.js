define([
    'backbone',
    'text!settings/templates/widget.html'
], function(Backbone, template) {

    template = _.template(template);

    return Backbone.View.extend({
        className: 'row-fluid',
        getConfig: $.noop,
        updateConfig: $.noop,

        initialize: function(options) {
            _.bindAll(this, 'getConfig', 'getName', 'updateConfig');

            if (!options.configItem) {
                throw 'Settings Widget Exception: A config item must be provided.';
            }

            this.configItem = options.configItem;
            this.description = options.description;
            this.serverName = options.serverName;
            this.strings = options.strings;
            this.title = options.title;
        },

        render: function() {
            this.$el.html(template({
                description: this.description,
                title: this.title
            }));
        },

        handleValidation: $.noop,

        getName: function() {
            return this.serverName || this.configItem;
        },

        shouldValidate: function() {
            return false;
        }
    });

});
