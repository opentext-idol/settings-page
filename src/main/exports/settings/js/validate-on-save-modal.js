define([
    'backbone',
    'text!settings/templates/validate-on-save-modal.html',
    'text!settings/templates/validation-error-message.html'
], function(Backbone, template, errorTemplate) {

    return Backbone.View.extend({
        className: 'modal hide fade',
        template: _.template(template),

        events: {
            'click #settings-save-ok': 'handleOk'
        },

        initialize: function(options) {
            _.bindAll(this, 'handleError', 'handleOk', 'handleSuccess', 'remove');
            this.config = options.config;
            this.configModel = options.configModel;
            this.strings = options.strings;
            this.successCallback = options.success;

            this.successTemplate = _.template('<div class="alert alert-success"><strong>' + this.strings.success +'</strong> ' + this.strings.successMessage + '</strong></div>');

            this.errorTemplate = _.template(errorTemplate, undefined, {variable: 'ctx'});

            this.throbberTemplate = _.template('<i class="icon-spinner icon-spin icon-2x" style="vertical-align: middle;"></i> <strong style="vertical-align: middle;">'
                + this.strings.saving + '</strong>');

            this.render();
        },

        render: function() {
            document.activeElement.blur();

            this.$el.html(this.template({strings: this.strings}))
                .modal({
                    backdrop: 'static',
                    keyboard: false
                })
                .on('hidden', this.remove);

            this.$cancel = this.$('button[data-dismiss="modal"]');
            this.$ok = this.$('#settings-save-ok');
            this.$body = this.$('.modal-body');
        },

        handleError: function(model, xhr) {
            this.$('button').removeAttr('disabled');
            this.$ok.html('<i class="icon-save"></i> ' + this.strings.retry);

            try {
                var response = JSON.parse(xhr.responseText);

                if (response.validation) {
                    this.$body.html(this.errorTemplate({validation: response.validation, strings: this.strings}));

                    this.trigger('validation', response.validation);
                } else if (response.exception) {
                    var exceptionMessage = this.strings.errorThrown + ' ' + response.exception;
                    this.$body.html(this.errorTemplate({message: exceptionMessage, strings: this.strings}));
                }
            } catch (e) {
                this.$body.html(this.errorTemplate({
                    message: this.strings.unknown,
                    strings: this.strings
                }));
            }
        },

        handleOk: function() {
            this.$('button').attr('disabled', 'disabled');
            this.$body.html(this.throbberTemplate);

            this.configModel.save({config: this.config}, {
                error: this.handleError,
                success: this.handleSuccess,
                wait: true
            });
        },

        handleSuccess: function() {
            this.$ok.hide();
            this.$cancel.removeAttr('disabled').html('<i class="icon-remove"></i> ' + this.strings.close);
            this.$body.html(this.successTemplate);
            this.successCallback();
            this.trigger('validation', 'SUCCESS');
        }
    });

});
