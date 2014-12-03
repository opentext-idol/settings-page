define([
    'settings/js/widget',
    'text!settings/templates/widgets/alerts-widget.html'
], function(Widget, template) {

    template = _.template(template);

    return Widget.extend({
        className: Widget.prototype.className + ' form-horizontal',

        events: {
            'change input[name=history-secs]': 'processPlural'
        },

        initialize: function(options) {
            Widget.prototype.initialize.call(this, options);
            _.bindAll(this, 'processPlural');
        },

        render: function() {
            Widget.prototype.render.call(this);
            this.$content.append(template({strings: this.strings}));
            this.$input = this.$('input[name=history-secs]');
            this.$span = this.$input.siblings('span');
        },

        getConfig: function() {
            return {historySecs: Number(this.$input.val()) * 86400};
        },

        processPlural: function() {
            var durationDays = this.$input.val();
            this.$span.text(durationDays == 1 ? this.strings.day : this.strings.days);
        },

        updateConfig: function(config) {
            this.$input.val(Number((config.historySecs / 86400).toFixed(1)));
            this.processPlural();
        }
    });

});
