define([
    'settings/js/widget',
    'text!settings/templates/widgets/path-widget.html'
], function(Widget, template) {

    return Widget.extend({
        className: Widget.prototype.className + ' form-horizontal',
        template: _.template(template),

        render: function() {
            Widget.prototype.render.call(this);
            this.$content.append(this.template({strings: this.strings}));
            this.$path = this.$('input[name="path"]');
        },

        getConfig: function() {
            return {path: this.$path.val()};
        },

        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);
            this.$path.val(config.path);
        },

        validateInputs: function() {
            if (this.$path.val() === '') {
                this.updateInputValidation(this.$path);
                return false;
            }

            return true;
        }
    });

});
