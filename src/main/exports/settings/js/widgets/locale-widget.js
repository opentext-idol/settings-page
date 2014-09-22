define([
    'settings/js/widget',
    'text!settings/templates/widgets/locale-widget.html'
], function(Widget, template) {

    return Widget.extend({
        localeTemplate: _.template(template),
        className: Widget.prototype.className + ' form-horizontal',

        initialize: function(options) {
            Widget.prototype.initialize.call(this, options);
            this.locales = options.locales;
        },

        render: function() {
            Widget.prototype.render.call(this);
            this.$content.append(this.localeTemplate({locales: this.locales, strings: this.strings}));
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
