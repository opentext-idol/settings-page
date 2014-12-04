define([
    'settings/js/widgets/aci-widget',
    'test/server-widget-test-utils',
    'jasmine-jquery'
], function(AciWidget, serverUtils) {

    describe('ACI widget', function() {
        var initialConfig = {
            host: 'myHost',
            port: 123,
            protocol: 'HTTP',
            productType: 'SERVICECOORDINATOR',
            indexErrorMessage: 'Coordinator:'
        };

        beforeEach(function() {
            serverUtils.standardBeforeEach.call(this, {
                WidgetConstructor: AciWidget,
                constructorOptions: _.extend({
                    strings: serverUtils.strings
                }, serverUtils.defaultOptions),
                initialConfig: initialConfig
            });

            this.$host = this.widget.$('input[name=host]');
            this.$port = this.widget.$('input[name=port]');
            this.$protocol = this.widget.$('select[name=protocol]');
        });

        serverUtils.standardTests.call(this, {initialConfig: initialConfig});

        it('should validate on load', function() {
            expect(this.widget.shouldValidate()).toBeTruthy();
            expect(this.widget.$('.settings-client-validation')).toHaveClass('hide');
        });

        it('should display the correct config', function() {
            expect(this.$protocol).toHaveValue('HTTP');
            expect(this.$host).toHaveValue('myHost');
            expect(this.$port).toHaveValue('123');
        });

        it('should return the correct config', function() {
            this.$host.val('host.example.com');
            this.$protocol.val('HTTPS');

            expect(this.widget.getConfig()).toEqual({
                host: 'host.example.com',
                indexErrorMessage: 'Coordinator:',
                port: 123,
                protocol: 'HTTPS',
                productType: 'SERVICECOORDINATOR'
            });
        });

        it('should fail client side validation on empty host', function() {
            this.$host.val('');
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect(this.widget.$el).not.toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');
            expect(this.widget.$el.find('.control-group')).toHaveClass('error');
            expect(this.widget.$el.find('.settings-client-validation')).not.toHaveClass('hide');
        });

        it('should remove previous client side validation on next validation', function() {
            var $hostControlGroup = this.widget.$el.find('.control-group');
            this.widget.lastValidationConfig = initialConfig;
            this.widget.handleValidation(initialConfig, {valid: true});

            expect(this.widget.$el).toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');
            expect($hostControlGroup).not.toHaveClass('error');

            this.$host.val('');
            this.widget.$('button[name="validate"]').click();

            expect(this.widget.$el).not.toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');
            expect($hostControlGroup).toHaveClass('error');
            expect(this.validationSpy).not.toHaveBeenCalled();
            expect(this.widget.$('.settings-client-validation')).not.toHaveClass('hide');

            this.$host.val('example.com');
            this.widget.$('button[name="validate"]').click();

            expect(this.widget.$el).not.toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');
            expect($hostControlGroup).not.toHaveClass('error');
            expect(this.validationSpy).toHaveBeenCalled();
            expect(this.widget.$('.settings-client-validation')).toHaveClass('hide');
        });
    });

});