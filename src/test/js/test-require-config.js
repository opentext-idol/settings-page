define(function() {
    require.config({
        paths: {
            // lib
            backbone: '/src/main/lib/backbone/backbone',
            bootstrap: '/src/main/lib/bootstrap/js/bootstrap',
            'js-utils': '/src/main/lib/javascript-utils',
            text: '/src/main/lib/require/text',

            // dir
            real: '/src/exports/settings',
            test: '/test',
            settings: '/src/exports/settings',

            // mock
            'settings/js/controls/enable-view': '/test/mock/enable-view',
            'settings/js/controls/password-view': '/test/mock/password-view',
            'settings/js/models/security-types': '/test/mock/security-types'
        },
        shim: {
            backbone: {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            }
        }
    });
});