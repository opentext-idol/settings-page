/*
 * Copyright 2013-2015 Hewlett-Packard Development Company, L.P.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 */

define([
    'js-testing/js/backbone-mock-factory'
], function(mockFactory) {

    return mockFactory.getView([
        'initialize',
        'onAdd',
        'onRemove',
        'onChange',
        'onSort'
    ]);

});
