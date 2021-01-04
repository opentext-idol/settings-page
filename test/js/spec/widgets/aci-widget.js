/*
 * (c) Copyright 2013-2015 Micro Focus or one of its affiliates.
 *
 * Licensed under the MIT License (the "License"); you may not use this file
 * except in compliance with the License.
 *
 * The only warranties for products and services of Micro Focus and its affiliates
 * and licensors ("Micro Focus") are as may be set forth in the express warranty
 * statements accompanying such products and services. Nothing herein should be
 * construed as constituting an additional warranty. Micro Focus shall not be
 * liable for technical or editorial errors or omissions contained herein. The
 * information contained herein is subject to change without notice.
 */

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
                    strings: _.extend({INCORRECT_SERVER_TYPE: _.identity, CONNECTION_ERROR: 'CONNECTION_ERROR'}, serverUtils.strings)
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
            expect(this.widget.$el).not.toHaveClass('has-success');
            expect(this.widget.$el).not.toHaveClass('has-error');
            expect(this.widget.$el.find('.form-group')).toHaveClass('has-error');
            expect(this.widget.$el.find('.settings-client-validation')).not.toHaveClass('hide');
        });

        it('should fail if the port is negative', function() {
            this.$port.val('-1');
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect(this.widget.$el).not.toHaveClass('has-success');
            expect(this.widget.$el).not.toHaveClass('has-error');
            expect(this.widget.$el.find('.form-group')).toHaveClass('has-error');
            expect(this.widget.$el.find('.settings-client-validation')).not.toHaveClass('hide');
        });

        it('should fail if the port is greater than 65535', function() {
            this.$port.val('65536');
            var isValid = this.widget.validateInputs();

            expect(isValid).toBeFalsy();
            expect(this.widget.$el).not.toHaveClass('has-success');
            expect(this.widget.$el).not.toHaveClass('has-error');
            expect(this.widget.$el.find('.form-group')).toHaveClass('has-error');
            expect(this.widget.$el.find('.settings-client-validation')).not.toHaveClass('hide');
        });

        it('should remove previous client side validation on next validation', function() {
            var $hostControlGroup = this.widget.$el.find('.form-group');
            this.widget.lastValidationConfig = initialConfig;
            this.widget.handleValidation(initialConfig, {valid: true});

            expect(this.widget.$el).toHaveClass('has-success');
            expect(this.widget.$el).not.toHaveClass('has-error');
            expect($hostControlGroup).not.toHaveClass('has-error');

            this.$host.val('');
            this.widget.$('button[name="validate"]').click();

            expect(this.widget.$el).not.toHaveClass('has-success');
            expect(this.widget.$el).not.toHaveClass('has-error');
            expect($hostControlGroup).toHaveClass('has-error');
            expect(this.validationSpy).not.toHaveBeenCalled();
            expect(this.widget.$('.settings-client-validation')).not.toHaveClass('hide');

            this.$host.val('example.com');
            this.widget.$('button[name="validate"]').click();

            expect(this.widget.$el).not.toHaveClass('has-success');
            expect(this.widget.$el).not.toHaveClass('has-error');
            expect($hostControlGroup).not.toHaveClass('has-error');
            expect(this.validationSpy).toHaveBeenCalled();
            expect(this.widget.$('.settings-client-validation')).toHaveClass('hide');
        });

        describe('getValidationFailureMessage', function() {
            it('should return a failure message for the INCORRECT_SERVER_TYPE error code', function() {
                var fakeResponse = {data: {validation: 'INCORRECT_SERVER_TYPE', friendlyNames: ['AXE', 'UASERVER']}};

                var failureMessage = this.widget.getValidationFailureMessage(fakeResponse);

                expect(failureMessage).toBe('AXE, UASERVER');
            });

            it('should return a failure message based on the error code', function() {
                var fakeResponse = {data: 'CONNECTION_ERROR'};

                var failureMessage = this.widget.getValidationFailureMessage(fakeResponse);

                expect(failureMessage).toBe('CONNECTION_ERROR');
            });
        })
    });

});
