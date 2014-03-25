define([
    'settings/js/widget',
    'text!settings/templates/widgets/port-widget.html'
], function(Widget, template) {

    return Widget.extend({
        className: Widget.prototype.className + ' form-horizontal',
        template: _.template(template),

        render: function() {
            Widget.prototype.render.call(this);
            this.$content.append(this.template({strings: this.strings}));
            this.$port = this.$('input[name="port"]');
        },

        getConfig: function() {
            return {
                port: parseInt(this.$port.val(), 10)
            };
        },

        updateConfig: function(config) {
            Widget.prototype.updateConfig.apply(this, arguments);
            this.$port.val(config.port);
        },

        validateInputs: function() {
            var port = parseInt(this.$port.val(), 10);

            if (isNaN(port) || port <= 0 || port > 65535) {
                this.updateInputValidation(this.$port);
                return false;
            }

            return true;
        }
    });

});