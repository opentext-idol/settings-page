define([
    'backbone',
    'text!settings/templates/controls/enable-view.html'
], function(Backbone, template) {

    template = _.template(template);

    return Backbone.View.extend({
        className: 'control-group',

        events: {
            'click button[name=enable]': 'toggleEnabled'
        },

        initialize: function(options) {
            _.bindAll(this, 'getConfig', 'toggleEnabled', 'updateConfig', 'updateFormatting');
            this.icon = options.enableIcon;
            this.strings = options.strings;
        },

        render: function() {
            this.$el.html(template({strings: this.strings}));
            this.$button = this.$('button[name=enable]');
        },

        getConfig: function() {
            return this.enabled;
        },

        toggleEnabled: function() {
            if (!_.isUndefined(this.enabled)) {
                this.enabled = !this.enabled;
                this.updateFormatting();
            }
        },

        updateConfig: function(config) {
            this.enabled = config;
            this.updateFormatting();
        },

        updateFormatting: function() {
            this.$button.toggleClass('btn-success', !this.enabled)
                .toggleClass('btn-danger', this.enabled)
                .html(this.enabled ? '<i class="icon-remove"></i> ' + this.strings.disable
                    : '<i class="' + this.icon + '"></i> ' + this.strings.enable)
                .siblings('label').text(
                    this.enabled ? this.strings.enabled
                        : this.strings.disabled);
        }
    });

});
