/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'settings/js/widgets/single-user-widget',
    'test/test-utils',
    'jasmine-jquery'
], function(SingleUserWidget, testUtils) {

    describe('Single User Widget', function() {
        beforeEach(function() {
            this.widget = new SingleUserWidget({
                configItem: 'singleUser',
                description: null,
                title: 'Single User',
                strings: {
                    confirmPassword: 'Confirm password',
                    currentPassword: 'Current Password',
                    iconClass: 'icon-fighter-jet',
                    newPassword: 'New Password',
                    passwordMismatch: "Passwords don't match",
                    passwordRedacted: 'Password Redacted',
                    username: 'Username',
                    validateCurrentPasswordBlank: 'Current password is blank',
                    validateConfirmPasswordBlank: 'Confirm password is blank',
                    validateNewPasswordBlank: 'New password is blank',
                    validateUsernameBlank: 'Username is blank'
                }
            });

            spyOn(this.widget.currentPassword, 'updateConfig');
            spyOn(this.widget.newPassword, 'updateConfig');
            spyOn(this.widget.confirmPassword, 'updateConfig');

            this.widget.render();
            this.widget.updateConfig({
                singleUser: {
                    passwordRedacted: true,
                    username: 'admin'
                }
            })
        });

        testUtils.testSuperProperties.call(this, {
            configItem: 'singleUser',
            description: null,
            title: 'Single User'
        });

        it('should return config in the correct format', function() {
            spyOn(this.widget.currentPassword, 'getConfig').andReturn({password: 'bar', passwordRedacted: false});
            spyOn(this.widget.newPassword, 'getConfig').andReturn({password: 'foo', passwordRedacted: false});
            spyOn(this.widget.confirmPassword, 'getConfig').andReturn({password: 'foo', passwordRedacted: false});

            expect(this.widget.getConfig()).toEqual({
                method: 'singleUser',
                singleUser: {
                    currentPassword: 'bar',
                    passwordRedacted: false,
                    plaintextPassword: 'foo',
                    username: 'admin'
                }
            })
        });

        it('should update its config correctly', function() {
            expect(this.widget.$username).toHaveValue('admin');

            expect(this.widget.currentPassword.updateConfig).toHaveBeenCalledWith({password: null, passwordRedacted: true});
            expect(this.widget.newPassword.updateConfig).toHaveBeenCalledWith({password: null, passwordRedacted: true});
            expect(this.widget.confirmPassword.updateConfig).toHaveBeenCalledWith({password: null, passwordRedacted: true});
        });

        describe('validation', function() {
            it('should be valid in its initial state', function() {
                spyOn(this.widget.newPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.confirmPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.currentPassword, 'getConfig').andReturn({passwordRedacted: true});

                expect(this.widget.validateInputs()).toBe(true);
            });

            it('should be invalid if the username input is blank', function() {
                spyOn(this.widget.currentPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.newPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.confirmPassword, 'getConfig').andReturn({passwordRedacted: true});
                this.widget.$username.val('');

                expect(this.widget.validateInputs()).toBe(false);
            });

            it('should be invalid if the current password view is invalid', function() {
                spyOn(this.widget.currentPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.newPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.confirmPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.currentPassword, 'validateInputs').andReturn(false);

                expect(this.widget.validateInputs()).toBe(false);
            });

            it('should be invalid if the new password view is invalid', function() {
                spyOn(this.widget.currentPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.newPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.confirmPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.newPassword, 'validateInputs').andReturn(false);

                expect(this.widget.validateInputs()).toBe(false);
            });

            it('should be invalid if the confirm password view is invalid', function() {
                spyOn(this.widget.currentPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.newPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.confirmPassword, 'getConfig').andReturn({passwordRedacted: true});
                spyOn(this.widget.confirmPassword, 'validateInputs').andReturn(false);

                expect(this.widget.validateInputs()).toBe(false);
            });

            it('should be invalid if any password view is not redacted and new password and confirm password do not match', function() {
                spyOn(this.widget.currentPassword, 'getConfig').andReturn({password: 'foo', passwordRedacted: false});
                spyOn(this.widget.newPassword, 'getConfig').andReturn({password: 'bar', passwordRedacted: false});
                spyOn(this.widget.confirmPassword, 'getConfig').andReturn({password: 'baz', passwordRedacted: false});

                expect(this.widget.validateInputs()).toBe(false);
            });
        });
    });

});