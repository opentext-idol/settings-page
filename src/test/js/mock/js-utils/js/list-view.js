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
