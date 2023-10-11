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

define(function() {
    require.config({
        baseUrl: '.',
        paths: {
            // lib
            backbone: 'node_modules/backbone/backbone',
            bootstrap: 'node_modules/bootstrap/dist/js/bootstrap',
            jquery: 'node_modules/jquery/dist/jquery',
            'jasmine-jquery': 'node_modules/jasmine-jquery/lib/jasmine-jquery',
            'js-whatever': 'node_modules/hp-autonomy-js-whatever/src',
            'js-testing': 'node_modules/hp-autonomy-js-testing-utils/src',
            sinon: 'node_modules/sinon/lib/sinon',
            text: 'node_modules/requirejs-text/text',
            'underscore': 'node_modules/underscore/underscore',

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
