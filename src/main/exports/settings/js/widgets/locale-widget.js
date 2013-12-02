define([
    'settings/js/widget',
    'text!settings/templates/widgets/locale-widget.html'
], function(Widget, template) {

    template = _.template(template);

    return Widget.extend({
        className: Widget.prototype.className + ' form-horizontal',

        initialize: function(options) {
            Widget.prototype.initialize.call(this, options);
            this.locales = options.locales;
        },

        render: function() {
            Widget.prototype.render.call(this);
            this.$el.append(template({locales: this.locales, strings: this.strings}));
            this.$select = this.$('select[name=locale]');
        },

        getConfig: function() {
            return this.$select.val();
        },

        updateConfig: function(config) {
            this.$select.val(config);
        }
    });

});
