/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'real/js/controls/password-view',
    'test/test-utils',
    'jasmine-jquery'
], function(PasswordView, utils) {

    describe('Password control', function() {
        var stringObject = utils.createStringMap('passwordRedacted', 'passwordLabel', 'passwordDescription');

        beforeEach(function() {
            jasmine.addMatchers({
                toBeRedacted: function() {
                    return {
                        compare: function (actual) {
                            var result = {};

                            if ('placeholder' in actual[0]) {
                                result.pass = actual.attr('placeholder') === 'passwordRedacted';
                            } else {
                                result.pass = actual.val() === 'passwordRedacted' && actual.hasClass('placeholder');
                            }

                            result.message = 'Expected ' + actual + (result.pass ? ' not ' : '') + ' to be redacted';

                            return result;
                        }
                    }
                }
            });

            this.passwordView = new PasswordView({strings: stringObject});
            this.passwordView.render();
            this.$input = this.passwordView.$('input[name=password]');
        });

        it('should update successfully with a new config', function() {
            this.passwordView.updateConfig({password: 'pw', passwordRedacted: false});

            expect(this.$input).not.toBeRedacted();
            expect(this.$input).toHaveValue('pw');
        });

        it('should update successfully with a new config with a redacted password', function() {
            this.passwordView.updateConfig({password: null, passwordRedacted: true});

            expect(this.$input).toBeRedacted();
        });

        it('should clear redaction on change', function() {
            this.passwordView.updateConfig({password: null, passwordRedacted: true});
            this.$input.trigger('change');

            expect(this.$input).not.toBeRedacted();
        });

        it('should not send a password if it has not changed', function() {
            this.passwordView.updateConfig({password: null, passwordRedacted: true});
            var config = this.passwordView.getConfig();

            expect(config.password).toEqual('');
            expect(config.passwordRedacted).toBeTruthy();
        });

        it('should send a password if it has changed', function() {
            this.passwordView.updateConfig({password: null, passwordRedacted: true});
            var password = 'my_special_$*%&("*_password';
            this.$input.val(password);
            this.$input.trigger('change');
            var config = this.passwordView.getConfig();

            expect(config.password).toEqual(password);
            expect(config.passwordRedacted).toBeFalsy();
        });

        it('should fail client side validation if the password is blank but not redacted', function() {
            var isValid;
            var $validationSpan = this.passwordView.$('.settings-client-validation');
            this.passwordView.updateConfig({password: null, passwordRedacted: true});

            expect($validationSpan).toHaveClass('hide');
            expect(this.passwordView.$el).not.toHaveClass('success');
            expect(this.passwordView.$el).not.toHaveClass('error');

            this.$input.val('').trigger('change');
            isValid = this.passwordView.validateInputs();

            expect(isValid).toBeFalsy();
            expect(this.passwordView.$el).toHaveClass('error');
            expect($validationSpan).not.toHaveClass('hide');

            this.$input.val('my-password').trigger('change');

            expect($validationSpan).toHaveClass('hide');
            expect(this.passwordView.$el).not.toHaveClass('success');
            expect(this.passwordView.$el).not.toHaveClass('error');

            isValid = this.passwordView.validateInputs();

            expect(isValid).toBeTruthy();
            expect($validationSpan).toHaveClass('hide');
            expect(this.passwordView.$el).not.toHaveClass('success');
            expect(this.passwordView.$el).not.toHaveClass('error');
        });

        it('should update the input state appropriately when setEnabled is called', function() {
            this.passwordView.updateConfig({password: null, passwordRedacted: true});
            this.$input.val('mypassword').trigger('change');
            this.passwordView.setEnabled(false);

            expect(this.$input).toHaveAttr('disabled');

            this.passwordView.setEnabled(true);

            expect(this.$input).not.toHaveAttr('disabled');
        });
    });

});
