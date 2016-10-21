/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define(function() {
    require.config({
        baseUrl: '.',
        paths: {
            // lib
            backbone: 'bower_components/backbone/backbone',
            bootstrap: 'bower_components/bootstrap/js/bootstrap',
            jquery: 'bower_components/jquery/jquery',
            'jasmine-jquery': 'bower_components/jasmine-jquery/lib/jasmine-jquery',
            'js-whatever': 'bower_components/hp-autonomy-js-whatever/src',
            'js-testing': 'bower_components/hp-autonomy-js-testing-utils/src',
            sinon: 'bower_components/sinon/index',
            text: 'bower_components/requirejs-text/text',
            'underscore': 'bower_components/underscore/underscore',

            // dir
            test: 'test/js'
        },
        shim: {
            bootstrap: ['jquery'],
            sinon: {
                exports: 'sinon'
            },
            'underscore': {
                exports: '_'
            }
        },
        // the jasmine grunt plugin loads all files based on their paths on disk
        // this breaks imports beginning in real or settings
        // map here fixes it
        // list mocks here, not above
        map: {
            '*': {
                'settings': 'src',
                'real': 'src',
                // mock
                'settings/js/controls/enable-view': 'test/mock/enable-view',
                'settings/js/controls/password-view': 'test/mock/password-view',
                'settings/js/models/security-types-model': 'test/mock/security-types',
                'js-whatever/js/list-view': 'test/mock/js-whatever/js/list-view'
            }
        }
    });
});