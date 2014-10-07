define([
    'backbone',
    'text!settings/templates/widget.html'
], function(Backbone, template) {

    return Backbone.View.extend({
        className: 'row-fluid accordion-group',
        getConfig: $.noop,
        controlGroupClass: 'control-group',
        formControlClass: '',
        successClass: 'success',
        errorClass: 'error',

        widgetTemplate: _.template(template),

        events: {
            'change input,select': 'handleInputChange'
        },

        initialize: function(options) {
            _.bindAll(this, 'getConfig', 'getName', 'handleValidation', 'shouldValidate', 'updateConfig', 'validateInputs');

            if (!options.configItem) {
                throw 'Settings Widget Exception: A config item must be provided.';
            }

            this.configItem = options.configItem;
            this.description = options.description;
            this.serverName = options.serverName;
            this.strings = options.strings;
            this.title = options.title;
            this.isOpened = options.isOpened;
        },

        render: function() {
            this.$el.html(this.widgetTemplate({
                description: this.description,
                title: this.title,
                configItem: this.configItem,
                isOpened: this.isOpened,
                iconClass: this.strings.iconClass
            }));

            this.$content = this.$('.widget-content');
        },

        getName: function() {
            return this.serverName || this.configItem;
        },

        handleInputChange: function() {
            this.hideValidationInfo();
            this.setValidationFormatting('clear');
        },

        handleValidation: $.noop,

        hideValidationInfo: function() {
            this.$('.settings-client-validation').addClass('hide');
        },

        setValidationFormatting: function(state) {
            this.$el.find('.' + this.controlGroupClass).removeClass(this.successClass + ' ' + this.errorClass);

            if (state === 'clear') {
                this.$el.removeClass(this.successClass + ' ' + this.errorClass);
            } else {
                this.$el.addClass(state)
                    .removeClass(state === this.successClass ? this.errorClass : this.successClass);
            }
        },

        shouldValidate: function() {
            return false;
        },

        updateConfig: function() {
            this.setValidationFormatting('clear');
            this.hideValidationInfo();
        },

        updateInputValidation: function($input, isValid) {
            var $controlGroup = $input.closest('.' + this.controlGroupClass);
            var $span = $controlGroup.find('.settings-client-validation');

            if (isValid) {
                $controlGroup.removeClass(this.errorClass);
                $span.addClass('hide');
            } else {
                $controlGroup.addClass(this.errorClass);
                $span.removeClass('hide');
            }
        },

        // Override to add client side validation.
        validateInputs: function() {
            return true;
        }
    });

});
