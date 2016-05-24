/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'settings/js/settings-page',
    'backbone',
    'sinon',
    'jasmine-jquery'
], function(SettingsPage, Backbone) {

    describe('Settings page', function() {
        var waitTime = 300;

        function modalToOpen() {
            return $('.modal').length === 1;
        }

        function modalToClose() {
            return $('.modal').length === 0;
        }

        function waitFor(condition, callback, context) {
            setTimeout(_.bind(function() {
                expect(condition()).toBeTruthy();

                if (condition) {
                    callback.call(context);
                }
            }, context), waitTime);
        }

        var initialConfig = {
            coordinator: {
                host: 'coordinatorHost',
                port: 1000
            },
            login: {
                community: {
                    host: 'communityHost',
                    port: 'communityPort'
                },
                method: 'autonomy'
            },
            tasks: {
                keepTime: 36
            }
        };

        var newConfig = {
            coordinator: {
                host: 'host',
                port: 123
            },
            login: {
                community: {
                    host: 'host2',
                    port: 112
                },
                method: 'none'
            },
            tasks: {
                keepTime: 60
            }
        };

        var CoordinatorWidget = Backbone.View.extend(_.extend({
            configItem: 'coordinator',
            getConfig: function() {
                return newConfig.coordinator;
            },
            getName: function() {
                return 'Coordinator';
            },
            render: function() {
                this.$el.html('<p>Coordinator</p>');
            },
            shouldValidate: function() {
                return true;
            },
            validateInputs: function() {
                return true
            }
        }, jasmine.createSpyObj('AciWidget', ['handleValidation', 'updateConfig'])));

        var CommunityWidget = Backbone.View.extend(_.extend({
            configItem: 'login',
            getConfig: function() {
                return newConfig.login;
            },
            getName: function() {
                return 'Community';
            },
            render: function() {
                this.$el.html('<p>Community</p>');
            },
            shouldValidate: function() {
                return true;
            },
            validateInputs: function() {
                return true
            }
        }, jasmine.createSpyObj('CommunityWidget', ['handleValidation', 'updateConfig'])));

        var TasksWidget = Backbone.View.extend(_.extend({
            configItem: 'tasks',
            getConfig: function() {
                return newConfig.tasks;
            },
            getName: function() {
                return 'Tasks';
            },
            render: function() {
                this.$el.html('<p>Tasks</p>');
            },
            shouldValidate: function() {
                return false;
            },
            validateInputs: function() {
                return true;
            }
        }, jasmine.createSpyObj('TasksWidget', ['updateConfig'])));

        var TestSettingsPage = SettingsPage.extend({
            router: _.extend({}, Backbone.Events),
            routeRoot: '/mysettings',
            routeEvent: 'route:mysettings',
            scrollSelector: 'body',
            validateUrl: 'example.com/validate',
            strings: {
                cancelButton: 'cancel',
                cancelCancel: 'Cancel',
                cancelOk: 'Ok',
                cancelMessage: 'This will delete all your stuff. Use with caution.',
                cancelTitle: 'Cancel',
                confirmUnload: 'Are you sure you want to navigate? We will delete all your things.',
                description: function(configEnv, configPath) {
                    return configEnv + ' ' + configPath;
                },
                icon: 'icon-fire-extinguisher',
                saveButton: 'save',
                saveDescription: 'This will save all the things.',
                saveModal: {
                    cancel: 'Cancel',
                    errorTitle: 'Warning! Big Scary Error!',
                    failure: 'fail',
                    failureAnd: 'et',
                    failureMessage: 'You failed. Sorry',
                    failureSuffix: '<p>Bad fail.</p>',
                    save: 'Save me!',
                    success: 'Success!!',
                    successMessage: 'Nice work.',
                    title: 'Jolly Save Modal',
                    validating: 'validating...'
                },
                title: 'Settings Page'
            },

            initializeWidgets: function() {
                this.widgetGroups = [
                    [new CommunityWidget()],
                    [new CoordinatorWidget()],
                    [new TasksWidget()]
                ];

                _.chain(this.widgetGroups).flatten().each(function(widget) {
                    spyOn(widget, 'getConfig').and.callThrough();
                    spyOn(widget, 'render').and.callThrough();
                });
            }
        });

        beforeEach(function() {
            this.originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 1600;

            this.server = sinon.fakeServer.create();
            this.configLoadCallback = null;
            this.saveErrorCallback = null;
            this.saveSuccessCallback = null;

            this.settingsPage = new (TestSettingsPage.extend({
                configModel: {
                    loaded: true,
                    fetch: jasmine.createSpy('configModel/fetch'),
                    get: _.bind(function(attribute) {
                        if (attribute === 'config') {
                            return initialConfig;
                        } else if (attribute === 'configEnvVariable') {
                            return 'ISA_Variable';
                        } else if (attribute === 'configPath') {
                            return 'C:\\config_path';
                        }
                    }, this),
                    onLoad: _.bind(function(callback, ctx) {
                        this.configLoadCallback = _.bind(callback, ctx);
                    }, this),
                    save: _.bind(function(attributes, options) {
                        this.saveErrorCallback = options.error;
                        this.saveSuccessCallback = options.success;
                    }, this)
                },
                vent: {
                    navigate: jasmine.createSpy('vent.navigate')
                }
            }))();

            spyOn(this.settingsPage.configModel, 'get').and.callThrough();
            spyOn(this.settingsPage.configModel, 'save').and.callThrough();
            this.settingsPage.render();
        });

        afterEach(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = this.originalTimeout;
            this.server.restore();
            this.settingsPage.remove();
            this.settingsPage.stopListening();
        });

        it('should initialize the widgets correctly', function() {
            expect(this.settingsPage.widgets.length).toEqual(3);
        });

        it('should render the widgets correctly', function() {
            _.each(this.settingsPage.widgets, function(widget) {
                expect(widget.render).toHaveBeenCalled();
            });

            var $widgets = this.settingsPage.$('.span4');

            expect($widgets).toHaveLength(3);
            expect($widgets.filter(':contains(Community)')).toHaveLength(1);
            expect($widgets.filter(':contains(Coordinator)')).toHaveLength(1);
            expect($widgets.filter(':contains(Tasks)')).toHaveLength(1);
        });

        it('should update the page description on config load', function() {
            this.configLoadCallback();
            expect(this.settingsPage.$('.settings-description')).toHaveText('ISA_Variable C:\\config_path');
        });

        it('should update widget config on config load', function() {
            this.configLoadCallback();

            _.each(this.settingsPage.widgets, function(widget) {
                expect(widget.updateConfig).toHaveBeenCalledWith(initialConfig[widget.configItem]);
            })
        });

        it('should send the correct validation request to the server on config load', function() {
            this.configLoadCallback();
            expect(this.server.requests.length).toEqual(1);

            var request = this.server.requests[0];
            expect(request.url).toEqual('example.com/validate');

            expect(JSON.parse(request.requestBody)).toEqual({
                coordinator: newConfig.coordinator,
                login: newConfig.login
            });
        });

        it('should set the lastValidationConfig parameter on a widget when validating a server', function() {
            this.configLoadCallback();

            _.each(this.settingsPage.widgets, function(widget) {
                if (widget.configItem === 'tasks') {
                    expect(widget.lastValidationConfig).toBeUndefined();
                } else {
                    expect(widget.lastValidationConfig).toEqual(newConfig[widget.configItem]);
                }
            });
        });

        it('should respond correctly to widget validation requests', function() {
            this.configLoadCallback();

            _.find(this.settingsPage.widgets,function(widget) {
                return widget.configItem === 'coordinator';
            }).trigger('validate');

            expect(this.server.requests.length).toEqual(2);
            var request = this.server.requests[1];
            expect(request.url).toEqual('example.com/validate');

            expect(JSON.parse(request.requestBody)).toEqual({
                coordinator: newConfig.coordinator
            });
        });

        it('should send validation responses to the relevant widgets', function() {
            this.configLoadCallback();

            var responseBody = {
                coordinator: {
                    valid: true
                },
                login: {
                    valid: false,
                    data: ['default', 'none']
                }
            };

            this.server.queue[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify(responseBody));

            _.each(this.settingsPage.widgets, function(widget) {
                if (widget.configItem !== 'tasks') {
                    expect(widget.handleValidation).toHaveBeenCalledWith(newConfig[widget.configItem], responseBody[widget.configItem]);
                }
            });
        });

        it('should scroll to the appropriate widget on routing', function() {
            spyOn(this.settingsPage, 'scrollToWidget');
            this.settingsPage.router.trigger('route:mysettings', 'login');

            var loginWidget = _.find(this.settingsPage.widgets, function(widget) {
                return widget.configItem === 'login';
            });

            expect(this.settingsPage.scrollToWidget).toHaveBeenCalledWith(loginWidget);
        });

        describe('Cancel button', function() {
            beforeEach(function() {
                this.configLoadCallback();
            });

            afterEach(function(done) {
                $('.modal-backdrop').click();

                waitFor(modalToClose, done);
            });

            it('should display a modal', function(done) {
                this.settingsPage.$('.settings-restore').click();

                waitFor(modalToOpen, done);
            });

            it('should be possible to cancel the modal', function(done) {
                this.settingsPage.$('.settings-restore').click();

                waitFor(modalToOpen, function() {
                    $('.modal').find('.cancelButton').click();

                    waitFor(modalToClose, done);
                })
            });

            it('should reset the inputs to the current config on confirm', function(done) {
                this.settingsPage.$('.settings-restore').click();

                waitFor(modalToOpen, function() {
                    $('.modal').find('.okButton').click();

                    waitFor(modalToClose, function() {
                        _.each(this.settingsPage.widgets, function(widget) {
                            expect(widget.updateConfig).toHaveBeenCalledWith(initialConfig[widget.configItem]);
                        });

                        done();
                    }, this)
                }, this);
            });
        });

        describe('Save Changes button', function() {
            it('should not open the modal if client side validation fails', function(done) {
                this.configLoadCallback();

                var loginWidget = _.find(this.settingsPage.widgets, function(widget) {
                    return widget.configItem === 'login';
                });

                spyOn(loginWidget, 'validateInputs').and.returnValue(false);
                this.settingsPage.$('button[type="submit"]').click();

                expect(loginWidget.validateInputs).toHaveBeenCalled();

                waitFor(modalToClose, done);
            });

            describe('on successful client side validation', function() {
                beforeEach(function(done) {
                    this.configLoadCallback();
                    this.settingsPage.$('button[type="submit"]').click();

                    waitFor(modalToOpen, function() {
                        this.$save = $('#settings-save-ok');
                        done();
                    }, this);
                });

                afterEach(function(done) {
                    $('.modal').modal('hide');

                    waitFor(modalToClose, done);
                });

                it('should be possible to cancel the modal', function(done) {
                    $('.modal button:not(#settings-save-ok)').click();

                    waitFor(modalToClose, done);
                });

                it('should attempt save the config on clicking save', function() {
                    expect(this.settingsPage.configModel.save).not.toHaveBeenCalled();
                    this.$save.click();
                    expect(this.settingsPage.configModel.save).toHaveBeenCalled();
                    expect(this.settingsPage.configModel.save.calls.mostRecent().args[0]).toEqual({config: newConfig});
                });

                it('should not be possible to close the modal after clicking save', function() {
                    this.$save.click();
                    expect(this.$save).toHaveAttr('disabled');
                    expect($('button[data-dismiss="modal"]')).toHaveAttr('disabled');
                });

                describe('on success', function() {
                    beforeEach(function() {
                        this.$save.click();
                        this.saveSuccessCallback();
                    });

                    it('should update the last saved config', function() {
                        expect(this.settingsPage.lastSavedConfig).toEqual(newConfig);
                    });

                    it('should be possible to close the modal', function(done) {
                        $('button[data-dismiss="modal"]').click();

                        waitFor(modalToClose, done);
                    });

                    it('should hide the save button', function() {
                        expect(this.$save).toBeHidden();
                    });

                    it('should apply the implicit successful validation to the widgets', function() {
                        var coordinatorWidget = _.find(this.settingsPage.widgets, function(widget) {
                            return widget.configItem === 'coordinator';
                        });

                        var communityWidget = _.find(this.settingsPage.widgets, function(widget) {
                            return widget.configItem === 'login';
                        });

                        expect(coordinatorWidget.handleValidation).toHaveBeenCalledWith(newConfig.coordinator, {valid: true});
                        expect(communityWidget.handleValidation).toHaveBeenCalledWith(newConfig.login, {valid: true});
                    });
                });

                describe('on error', function() {
                    var testErrorHandling = function() {
                        expect(this.$save).not.toHaveAttr('disabled');
                        expect(this.$save).not.toBeHidden();
                        expect($('button[data-dismiss="modal"]')).not.toHaveAttr('disabled');
                    };

                    beforeEach(function() {
                        this.$save.click();
                    });

                    it('should handle validation errors', function() {
                        this.saveErrorCallback({}, {responseText: JSON.stringify({
                            validation: {coordinator: {valid: false}, login: {valid: true}}
                        })});

                        var coordinatorWidget = _.find(this.settingsPage.widgets, function(widget) {
                            return widget.configItem === 'coordinator';
                        });

                        var communityWidget = _.find(this.settingsPage.widgets, function(widget) {
                            return widget.configItem === 'login';
                        });

                        expect(coordinatorWidget.handleValidation).toHaveBeenCalledWith(newConfig.coordinator, {valid: false});
                        expect(communityWidget.handleValidation).toHaveBeenCalledWith(newConfig.login, {valid: true});
                        testErrorHandling.call(this);
                    });

                    it('should handle server exceptions', function() {
                        this.saveErrorCallback({}, {responseText: JSON.stringify({
                            exception: "Something gone bad."
                        })});

                        testErrorHandling.call(this);
                    });
                });
            });
        });

        describe('handleBeforeUnload', function() {
            beforeEach(function() {
                this.configLoadCallback();
            });

            it('should not trigger an alert if the settings have been saved', function() {
                expect(this.settingsPage.handleBeforeUnload()).toBeUndefined();
            });

            it('should trigger an alert if the settings have not been saved, then navigate back to the settings page', function(done) {
                _.each(this.settingsPage.widgets, function(widget) {
                    widget.getConfig = function() {
                        return initialConfig[widget.configItem];
                    }
                });

                expect(this.settingsPage.vent.navigate).not.toHaveBeenCalled();
                expect(this.settingsPage.handleBeforeUnload()).toBeDefined();

                setTimeout(_.bind(function() {
                    expect(this.settingsPage.vent.navigate).toHaveCallCount(1);
                    expect(this.settingsPage.vent.navigate).toHaveBeenCalledWith('/mysettings', {trigger: true});
                    done();
                }, this), 200);
            });
        });
    });

});
