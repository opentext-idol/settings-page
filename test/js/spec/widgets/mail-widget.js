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
    'underscore',
    'settings/js/widgets/mail-widget',
    'test/server-widget-test-utils',
    'test/test-utils',
    'jasmine-jquery'
], function(_, MailWidget, serverUtils, utils) {

    describe('Mail widget', function() {
        var initialConfig = {
            enabled: true,
            connectionSecurity: 'STARTTLS',
            from: 'meg@hpe.com',
            host: 'myHost',
            password: '',
            passwordRedacted: true,
            port: 587,
            username: 'user',
            to: ['jeff@example.com', 'bobby@example2.com']
        };

        beforeEach(function() {
            serverUtils.standardBeforeEach.call(this, {
                WidgetConstructor: MailWidget,
                constructorOptions: _.extend({
                    securityTypes: utils.createStringMap('NONE', 'STARTTLS', 'TLS'),
                    strings: serverUtils.strings
                }, serverUtils.defaultOptions),
                initialConfig: initialConfig
            });

            this.$checkbox = this.widget.$('input[type="checkbox"]');
            this.$host = this.widget.$('input[name=host]');
            this.$port = this.widget.$('input[name=port]');
            this.$security = this.widget.$('select[name=connection-security]');
            this.$username = this.widget.$('input[name=username]');
            this.$from = this.widget.$('input[name=from]');
            this.$to = this.widget.$('input[name=to]');
        });

        serverUtils.standardTests.call(this, {initialConfig: initialConfig});
        serverUtils.testDisablableServerShouldValidateFunction.call(this, {initialConfig: initialConfig});

        it('should initialize the password view with "required" option disabled', function() {
            expect(this.widget.passwordView.required).toBeFalsy();
        });

        it('should render connection security correctly', function() {
            var $options = this.widget.$('select[name=connection-security] option');
            expect($options).toHaveLength(3);

            var $NONE = $options.filter('[value=NONE]');
            expect($NONE).toHaveLength(1);
            expect($NONE).toHaveText('NONE');

            var $STARTTLS = $options.filter('[value=STARTTLS]');
            expect($STARTTLS).toHaveLength(1);
            expect($STARTTLS).toHaveText('STARTTLS');

            var $TLS = $options.filter('[value=TLS]');
            expect($TLS).toHaveLength(1);
            expect($TLS).toHaveText('TLS');
        });

        it('should display the correct config', function() {
            expect(this.$host).toHaveValue('myHost');
            expect(this.$port).toHaveValue('587');
            expect(this.$security).toHaveValue('STARTTLS');
            expect(this.$username).toHaveValue('user');
            expect(this.$from).toHaveValue('meg@hpe.com');
            expect(this.$to).toHaveValue('jeff@example.com,bobby@example2.com');
            expect(this.widget.enableView.enabled).toBeTruthy();

            var passwordViewArgs = this.widget.passwordView.updateConfig.calls.mostRecent().args[0];
            expect(passwordViewArgs.password).toEqual('');
            expect(passwordViewArgs.passwordRedacted).toBeTruthy();
        });

        it('should return the correct config', function() {
            this.widget.enableView.enabled = false;
            this.$security.val('TLS');
            this.$to.val('jeff@example.com,bobby@example2.com, alice@example.com');

            expect(this.widget.getConfig()).toEqual(_.defaults({
                connectionSecurity: 'TLS',
                enabled: false,
                to: ['jeff@example.com', 'bobby@example2.com', 'alice@example.com']
            }, initialConfig));
        });

        it('should set default port for selected connection security unless it has been changed', function() {
            this.$security.val('TLS').trigger('change');
            expect(this.widget.getConfig().port).toEqual(465);

            this.widget.$('input[name=port]').val(123);
            this.$security.val('NONE').trigger('change');
            expect(this.widget.getConfig().port).toEqual(123);
        });

        it('should fail client side validation on empty host, from or to', function() {
            var isValid;
            this.$host.val('');
            isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect(this.$host.closest('.control-group')).toHaveClass('error');
            expect(this.$from.siblings('.settings-client-validation')).toHaveClass('hide');
            expect(this.widget.$el).not.toHaveClass('success');

            this.$from.val('');
            isValid = this.widget.validateInputs();
            expect(isValid).toBeFalsy();
            expect(this.$host.closest('.control-group')).toHaveClass('error');
            expect(this.$host.siblings('.settings-client-validation')).not.toHaveClass('hide');
            expect(this.$from.closest('.control-group')).toHaveClass('error');
            expect(this.$from.siblings('.settings-client-validation')).not.toHaveClass('hide');
            expect(this.widget.$el).not.toHaveClass('success');
        });

        it('should remove previous client side validation on next validation', function() {
            var $hostControlGroup = this.$host.closest('.control-group');
            var $hostValidationSpan = this.$host.siblings('.settings-client-validation');
            this.widget.lastValidationConfig = initialConfig;

            this.$host.val('');
            this.widget.$('button[name="validate"]').click();

            expect(this.widget.$el).not.toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');
            expect($hostControlGroup).toHaveClass('error');
            expect(this.validationSpy).not.toHaveBeenCalled();
            expect($hostValidationSpan).not.toHaveClass('hide');

            this.$host.val('example.com');
            this.widget.$('button[name="validate"]').click();

            expect(this.widget.$el).not.toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');
            expect($hostControlGroup).not.toHaveClass('error');
            expect(this.validationSpy).toHaveBeenCalled();
            expect($hostValidationSpan).toHaveClass('hide');

            this.$host.val(initialConfig.host).trigger('change');
            this.widget.handleValidation(initialConfig, {valid: true});

            expect(this.widget.$el).toHaveClass('success');
            expect(this.widget.$el).not.toHaveClass('error');
            expect($hostControlGroup).not.toHaveClass('error');
            expect($hostValidationSpan).toHaveClass('hide');
        });

        it('should correctly decide whether to retain the checkbox state on updateConfig', function() {
            expect(this.$checkbox).toHaveProp('checked', true);

            this.$checkbox.prop('checked', false).trigger('change');

            expect(this.$checkbox).toHaveProp('checked', false);

            this.widget.updateConfig(_.defaults({username: ''}, initialConfig));

            expect(this.$checkbox).toHaveProp('checked', false);

        });

        it('should fail client side validation on empty username and password when the checkbox is checked', function() {
            spyOn(this.widget.passwordView, 'validateInputs').and.callThrough();
            this.$username.val('').trigger('change');
            var $usernameInfo = this.$username.siblings('.settings-client-validation');
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect($usernameInfo).not.toHaveClass('hide');
            expect(this.widget.passwordView.validateInputs).toHaveBeenCalled();

            this.$checkbox.prop('checked', false).trigger('change');

            isValid = this.widget.validateInputs();
            expect(isValid).toBeTruthy();
            expect($usernameInfo).toHaveClass('hide');
            expect(this.widget.passwordView.validateInputs).toHaveCallCount(1);
        });
    });

});
