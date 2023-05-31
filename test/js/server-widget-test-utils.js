/*
 * Copyright 2013-2015 Open Text.
 *
 * Licensed under the MIT License (the "License"); you may not use this file
 * except in compliance with the License.
 *
 * The only warranties for products and services of Open Text and its affiliates
 * and licensors ("Open Text") are as may be set forth in the express warranty
 * statements accompanying such products and services. Nothing herein should be
 * construed as constituting an additional warranty. Open Text shall not be
 * liable for technical or editorial errors or omissions contained herein. The
 * information contained herein is subject to change without notice.
 */

define([
    'test/test-utils'
], function(utils) {

    function testValidationFormatting(isValid) {
        var $span = this.widget.$('.settings-server-validation');

        expect(this.widget.$el).toHaveClass(isValid ? 'success' : 'error');
        expect(this.widget.$el).not.toHaveClass(isValid ? 'error' : 'success');
        expect($span).toHaveText(isValid ? 'validateSuccess' : 'validateFailed');
    }

    function testDisablableServerShouldValidateFunction(options) {
        it('should only validate on load if enabled', function() {
            expect(this.widget.shouldValidate()).toBeTruthy();

            this.widget.updateConfig(_.defaults({enabled: false}, options.initialConfig));

            expect(this.widget.shouldValidate()).toBeFalsy();
        });
    }

    function standardBeforeEach(options) {
        this.widget = new options.WidgetConstructor(options.constructorOptions);

        if (this.widget.passwordView) {
            spyOn(this.widget.passwordView, 'getConfig').and.returnValue({password: '', passwordRedacted: true});
            spyOn(this.widget.passwordView, 'updateConfig');
        }

        if (this.widget.enableView) {
            spyOn(this.widget.enableView, 'getConfig').and.callThrough();
            spyOn(this.widget.enableView, 'updateConfig').and.callThrough();
        }

        this.widget.render();
        this.widget.updateConfig(options.initialConfig);

        this.validationSpy = jasmine.createSpy('validationSpy');
        this.widget.on('validate', this.validationSpy);
    }

    function standardTests(options) {
        var initialConfig = options.initialConfig;

        utils.testSuperProperties.call(this, {
            configItem: 'configItem',
            description: 'description',
            title: 'title'
        });

        it('should correctly colour the inputs on validation success', function() {
            this.widget.lastValidationConfig = initialConfig;
            this.widget.handleValidation(initialConfig, {valid: true});
            testValidationFormatting.call(this, true);
        });

        it('should correctly colour the inputs on validation failed', function() {
            this.widget.lastValidationConfig = initialConfig;
            this.widget.handleValidation(initialConfig, {valid: false});
            testValidationFormatting.call(this, false);
        });

        it('should restore the previous validation formatting if the validated config is re-entered', function() {
            this.widget.lastValidationConfig = initialConfig;
            this.widget.handleValidation(initialConfig, {valid: true});
            expect(this.widget.$el).toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');

            var $host = this.widget.$('input[name=host]');
            var validHost = $host.val();
            $host.val('junk').trigger('change');
            expect(this.widget.$el).not.toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');

            $host.val(validHost).trigger('change');
            expect(this.widget.$el).toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');
        });

        it('should deal with two validation requests in quick succession', function() {
            this.widget.$('input[name=host]').val('yoda');
            var goodConfig = this.widget.getConfig();
            this.widget.lastValidationConfig = goodConfig;

            this.widget.handleValidation(goodConfig, {valid: true});
            expect(this.widget.$el).toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');

            this.widget.handleValidation(initialConfig, {valid: false});
            expect(this.widget.$el).toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');
        });

        it('should only update the server validation formatting if the inputs have not changed since the validation was requested', function() {
            this.widget.lastValidationConfig = initialConfig;
            var initialHost = this.widget.$('input[name="host"]').val();
            this.widget.$('input[name="host"]').val('yoda').trigger('change');
            this.widget.handleValidation(initialConfig, {valid: false});

            expect(this.widget.$el).not.toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');

            this.widget.$('input[name="host"]').val(initialHost).trigger('change');

            expect(this.widget.$el).toHaveClass('error');
            expect(this.widget.$el).not.toHaveClass('success');
        });

        it('should pass client side validation with all required inputs completed', function() {
            expect(this.widget.validateInputs()).toBeTruthy();
            expect(this.widget.$el.find('.control-group')).not.toHaveClass('success');
            expect(this.widget.$el.find('.control-group')).not.toHaveClass('error');
        });

        it('should trigger validation on clicking the test button if client side validation passes', function() {
            spyOn(this.widget, 'validateInputs').and.returnValue(true);
            this.widget.$('button[name=validate]').click();

            expect(this.validationSpy).toHaveBeenCalled();
        });
    }

    return {
        defaultOptions: utils.createStringMap('configItem', 'description', 'title'),
        standardBeforeEach: standardBeforeEach,
        standardTests: standardTests,
        testValidationFormatting: testValidationFormatting,
        testDisablableServerShouldValidateFunction: testDisablableServerShouldValidateFunction,

        strings: utils.createStringMap('confirmOkText', 'confirmMessage', 'confirmTitle', 'connectionSecurity',
            'databaseLabel', 'disable', 'disabled', 'enable', 'enabled', 'fromLabel', 'hostPlaceholder', 'loading',
            'loginTypeLabel', 'passwordLabel', 'passwordRedacted', 'passwordDescription', 'portPlaceholder', 'toDescription',
            'toLabel', 'usernameLabel', 'validateButton', 'validateFailed', 'validateSuccess')
    };

});
