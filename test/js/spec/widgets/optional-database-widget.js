/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'settings/js/widgets/optional-database-widget',
    'test/server-widget-test-utils',
    'jasmine-jquery'
], function(DatabaseWidget, serverUtils) {

    describe('Optional database widget', function() {
        function testDatabaseCheckbox(initialConfig) {
            it('should use the username for the database name when the checkbox is checked', function() {
                var $checkbox = this.widget.$('input[type="checkbox"]');
                var $username = this.widget.$('input[name="username"]');
                var $database = this.widget.$('input[name="database"]');

                var datasourceConfig = _.defaults({
                    username: 'postgres',
                    url: 'jdbc:postgresql://myHost:123/postgres'
                }, initialConfig.datasource);
                this.widget.updateConfig(_.defaults({
                    datasource: datasourceConfig
                }, initialConfig));

                expect($checkbox).toHaveProp('checked', true);
                expect($username).toHaveValue('postgres');
                expect($database).toHaveValue('postgres');

                $checkbox.prop('checked', false).trigger('change');
                $username.val('myUser').trigger('change');
                $database.val('siteadmin').trigger('change');

                expect($username).toHaveValue('myUser');
                expect($database).toHaveValue('siteadmin');

                $checkbox.prop('checked', true).trigger('change');

                expect($username).toHaveValue('myUser');
                expect($database).toHaveValue('myUser');
            });

            it('should fail client side validation on empty database', function() {
                var $database = this.widget.$('input[name="database"]');
                $database.val('');

                expect(this.widget.validateInputs()).toBe(false);
            });
        }

        describe('when it has an enabled widget', function() {
            var initialConfig = {
                enabled: true,
                datasource: {
                    platform: 'postgres',
                    hibernateDialect: 'org.hibernate.dialect.PostgreSQL82Dialect',
                    driverClassName: 'org.postgresql.Driver',
                    url: 'jdbc:postgresql://myHost:123/myDatabase',
                    password: '',
                    passwordRedacted: true,
                    username: 'user'
                }
            };

            beforeEach(function() {
                serverUtils.standardBeforeEach.call(this, {
                    WidgetConstructor: DatabaseWidget,
                    constructorOptions: _.extend({
                        databaseType: 'postgres',
                        strings: serverUtils.strings
                    }, serverUtils.defaultOptions),
                    initialConfig: initialConfig
                });
            });

            serverUtils.testDisablableServerShouldValidateFunction.call(this, {initialConfig: initialConfig});

            it('should display the correct config', function() {
                expect(this.widget.$('input[name=host]')).toHaveValue('myHost');
                expect(this.widget.$('input[name=port]')).toHaveValue('123');
                expect(this.widget.$('input[name=database]')).toHaveValue('myDatabase');
                expect(this.widget.$('input[name=username]')).toHaveValue('user');
                expect(this.widget.enableView.enabled).toBeTruthy();

                var passwordViewArgs = this.widget.passwordView.updateConfig.calls.mostRecent().args[0];
                expect(passwordViewArgs.password).toEqual('');
                expect(passwordViewArgs.passwordRedacted).toBeTruthy();
            });

            it('should return the correct config', function() {
                expect(this.widget.getConfig()).toEqual(initialConfig)
            });

            testDatabaseCheckbox.call(this, initialConfig);
        });
    });

});