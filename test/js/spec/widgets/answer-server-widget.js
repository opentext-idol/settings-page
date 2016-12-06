/*
 * Copyright 2016 Hewlett Packard Enterprise Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'underscore',
    'settings/js/widgets/answer-server-widget',
    'jasmine-jquery'
], function (_, AnswerServerWidget) {

    describe('AnswerServer widget', function () {
        var createStringMap = function () {
            var obj = {};
            _.each(arguments, function (arg) {
                obj[arg] = arg;
            });
            return obj;
        };

        var strings = createStringMap('confirmOkText', 'confirmMessage', 'confirmTitle', 'connectionSecurity',
            'databaseLabel', 'disable', 'disabled', 'enable', 'enabled', 'fromLabel', 'hostPlaceholder', 'loading',
            'systemNameLabel', 'passwordLabel', 'passwordRedacted', 'passwordDescription', 'portPlaceholder', 'toDescription',
            'toLabel', 'usernameLabel', 'validateButton', 'validateFailed', 'validateSuccess');

        var initialConfig = {
            server: {
                host: 'example.com',
                port: 9003,
                protocol: 'HTTPS',
                productType: 'ANSWERSERVER',
                indexErrorMessage: undefined
            },
            systemName: 'answerbank0',
            enabled: true
        };

        beforeEach(function () {
            jasmine.addMatchers({
                toDisplayConfig: function () {
                    return {
                        compare: function (actual, config) {
                            var $el = actual;

                            var actualConfig = {
                                // need to account for things like productType which don't go in the DOM
                                server: _.defaults({
                                    host: $el.find('input[name="host"]').val(),
                                    port: Number($el.find('input[name="port"]').val()),
                                    protocol: $el.find('select[name="protocol"]').val()
                                }, config.server),
                                systemName: $el.find('select[name="aci-widget-dropdown"]').val(),
                                enabled: config.enabled
                            };

                            var pass = _.isEqual(config, actualConfig);

                            return {
                                pass: pass,
                                message: function () {
                                    return 'Expected "' + JSON.stringify(actualConfig) + '"' +
                                        (pass ? ' not ' : '') +
                                        ' to display config "' + JSON.stringify(config) + '"';
                                }
                            };
                        }
                    }
                },
                toContainOptions: function () {
                    return {
                        compare: function (actual, options) {
                            // Doesn't account for duplicates.
                            var $select = actual;
                            var $options = $select.find('option');

                            if ($options.length !== options.length) {
                                return false;
                            }

                            var isMatch = true;

                            _.each(options, function (value) {
                                if (isMatch && $options.filter('[value="' + value + '"]').length !== 1) {
                                    isMatch = false;
                                }
                            });

                            return {
                                pass: isMatch,
                                message: function () {
                                    return 'Expected "' + $select.get(0).outerHTML + '"' + (isMatch ? ' not ' : '') + ' to contain options "' + JSON.stringify(options) + '"';
                                }
                            };
                        }
                    };
                }
            });

            this.widget = new AnswerServerWidget({
                configItem: 'answerServer',
                description: "This widget controls Data Admin's connection to your Answer Server.",
                productType: 'ANSWERSERVER',
                systemNamesUrl: '/answerbank-system-names',
                strings: strings,
                title: 'Answer Server'
            });

            this.systemNamesModel = this.widget.dropdownView.model;
            spyOn(this.systemNamesModel, 'fetch');
            this.widget.render();
            this.$systemName = this.widget.$('select[name="aci-widget-dropdown"]');
            this.$aciDetails = this.widget.$('div.control-group').eq(0);
        });

        it('should render correctly', function () {
            expect(this.widget.$el).toDisplayConfig({
                server: {host: '', port: 0, protocol: 'HTTP'},
                systemName: null,
                enabled: true
            });
            expect(this.$systemName).toHaveAttr('disabled');
            expect(this.$aciDetails).not.toHaveClass('success');
            expect(this.$aciDetails).not.toHaveClass('error');
        });

        describe('after a config update', function () {
            beforeEach(function () {
                this.widget.updateConfig(initialConfig);
            });

            it('should display the correct config', function () {
                expect(this.widget.$el).toDisplayConfig(initialConfig);
            });

            it('should return the correct config', function () {
                expect(this.widget.getConfig()).toEqual(initialConfig);
            });

            it('should keep the system name input disabled', function () {
                expect(this.$systemName).toHaveAttr('disabled');
            });

            it('should apply error formatting after failed validation', function () {
                this.widget.lastValidationConfig = initialConfig;
                this.widget.handleValidation(initialConfig, {valid: false});

                expect(this.$aciDetails).toHaveClass('error');
                expect(this.$aciDetails).not.toHaveClass('success');
                expect(this.systemNamesModel.fetch).not.toHaveBeenCalled();
            });

            it('should fail client side validation with an empty host input', function () {
                var $host = this.widget.$('input[name="host"]');
                var $clientValidationSpan = this.widget.$('.settings-client-validation');

                this.widget.lastValidationConfig = initialConfig;
                this.widget.handleValidation(initialConfig, {valid: true});

                expect(this.widget.$el).not.toHaveClass('success');
                expect(this.$aciDetails).toHaveClass('success');
                expect($clientValidationSpan).toHaveClass('hide');

                $host.val('').trigger('change');

                expect(this.widget.$el).not.toHaveClass('success');
                expect(this.$aciDetails).not.toHaveClass('success');
                expect(this.$aciDetails).not.toHaveClass('error');
                expect($clientValidationSpan).toHaveClass('hide');

                var isValid = this.widget.validateInputs();

                expect(isValid).toBeFalsy();
                expect(this.widget.$el).not.toHaveClass('success');
                expect(this.$aciDetails).toHaveClass('error');
                expect(this.$aciDetails).not.toHaveClass('success');
                expect($clientValidationSpan).toHaveClass('hide');

                $host.val('yoda').trigger('change');

                expect(this.widget.$el).not.toHaveClass('success');
                expect(this.$aciDetails).not.toHaveClass('error');
                expect(this.$aciDetails).not.toHaveClass('success');
                expect($clientValidationSpan).toHaveClass('hide');

                $host.val(initialConfig.server.host).trigger('change');

                expect(this.widget.$el).not.toHaveClass('success');
                expect(this.$aciDetails).toHaveClass('success');
                expect(this.$aciDetails).not.toHaveClass('error');
                expect($clientValidationSpan).toHaveClass('hide');
            });

            describe('after a change to the port input', function () {
                beforeEach(function () {
                    this.$port = this.widget.$('input[name="port"]').val(123).trigger('change');
                });

                it('should not apply the validation response when it returns', function () {
                    this.widget.lastValidationConfig = initialConfig;
                    this.widget.handleValidation(initialConfig, {valid: true});

                    expect(this.$aciDetails).not.toHaveClass('success');

                    this.$port.val(9003).trigger('change');

                    expect(this.$aciDetails).toHaveClass('success');
                    expect(this.$aciDetails).not.toHaveClass('error');
                });
            });

            describe('after successful validation', function () {
                beforeEach(function () {
                    this.widget.lastValidationConfig = initialConfig;
                    this.widget.handleValidation(initialConfig, {valid: true});
                });

                it('should apply success formatting to the aci details inputs', function () {
                    expect(this.$aciDetails).toHaveClass('success');
                    expect(this.$aciDetails).not.toHaveClass('error');
                    expect(this.widget.$el).not.toHaveClass('success');
                    expect(this.widget.$el).not.toHaveClass('error');
                });

                it('should keep the system name input disabled and fetch new system names', function () {
                    expect(this.$systemName).toHaveAttr('disabled');
                    expect(this.systemNamesModel.fetch).toHaveBeenCalled();
                    expect(this.systemNamesModel.fetch).toHaveCallCount(1);

                    expect(this.systemNamesModel.fetch).toHaveBeenCalledWith({
                        data: {
                            host: initialConfig.server.host,
                            port: initialConfig.server.port,
                            protocol: initialConfig.server.protocol
                        }
                    });
                });

                it('should correctly handle new system names containing the currently selected name', function () {
                    //noinspection AssignmentResultUsedJS
                    var newSystemNames = ['answerbank0', 'answerbank1', 'factbank0'];
                    this.systemNamesModel.set({systemNames: newSystemNames});

                    expect(this.$systemName).not.toHaveAttr('disabled');
                    expect(this.widget.$el).toDisplayConfig(initialConfig);
                    expect(this.$systemName).toContainOptions(newSystemNames);
                });

                describe('after change to the host input', function () {
                    beforeEach(function () {
                        this.$host = this.$aciDetails.find('[name="host"]');
                        this.$host.val('my-new-host.com').trigger('change');
                    });

                    it('should clear validation formatting', function () {
                        expect(this.$aciDetails).not.toHaveClass('success');
                        expect(this.$aciDetails).not.toHaveClass('error');
                    });

                    it('should not enable the system name input on new system names', function () {
                        this.systemNamesModel.set({systemNames: ['answerbank0', 'factbank0']});
                        
                        expect(this.$systemName).toHaveAttr('disabled');

                        this.$host.val('example.com').trigger('change');

                        expect(this.$systemName).not.toHaveAttr('disabled');
                    });

                    it('should return validation formatting if it is changed back', function () {
                        this.$host.val('example.com').trigger('change');

                        expect(this.$aciDetails).toHaveClass('success');
                        expect(this.$aciDetails).not.toHaveClass('error');
                    });

                    it('should return the correct config', function () {
                        expect(this.widget.getConfig()).toEqual(_.defaults({
                            server: _.defaults({
                                host: 'my-new-host.com'
                            }, initialConfig.server)
                        }, initialConfig));
                    });

                    it('should trigger validation on clicking Test Connection', function () {
                        spyOn(this.widget, 'trigger');
                        this.widget.$('[name="validate"]').click();

                        expect(this.widget.trigger).toHaveBeenCalledWith('validate');
                    });
                });
            });
        });
    });

});