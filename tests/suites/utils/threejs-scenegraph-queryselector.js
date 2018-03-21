'use strict';
/* global assert, process, setup, suite, test */



function getCSSTestData () {
    return {
        id: 39,
        visible: true,
        children: [
            {
                id: 40,
                type: 'someClass',
                geometry:
                    {
                        boundingSphere: {radius: 5}
                    }
            },
            {
                id: 41,
                geometry:
                    {
                        boundingSphere: {radius: 10}
                    }
            }]
    };
}

function prepareData (data) {
    function traverse (callback1) {
        callback1(this);

        inject(this);

        var children = this.children;

        inject(data);
        for (var i = 0, l = children.length; i < l; i++) {
            children[i].traverse(callback1);
        }
    }

    function inject (data) {
        if (!data.traverse) {
            data.traverse = traverse;
        }
        if (!data.children) {
            data.children = [];
        }

        for (var i = 0, l = data.children.length; i < l; i++) {
            data.children[i].traverse = traverse;
        }
    }

    inject(data);
    return data;
}


// TODO separate tests and also put into separate package
function testCSSSelectors () {
    var testData = prepareData(getCSSTestData());

    var queries = [
        {string: '#39', count: 1},
        {string: ':where(geometry)', count: 2},
        {string: ':where(geometry-boundingSphere)', count: 2},
        {string: ':where(geometry-boundingSphere==null)', count: 0},
        {string: ':where(geometry-boundingSphere-radius)', count: 2},
        {string: ':where(geometry-boundingSphere-radius<10)', count: 1},
        {string: ':where(geometry-boundingSphere-radius<=10)', count: 2},
        {string: ':where(id<40)', count: 1},
        {string: '.someClass', count: 1},
        {string: '[geometry]', count: 2},
        {string: '[visible]', count: 1},
        {string: '[visible] > #40', count: 1},
        {string: '#40, #40', count: 1},
        {string: '*', count: 3}

    ];

    _.each(queries, function (query) {
        console.group('query:' + query.string);

        try {
            var result = querySelectorAll(testData, query.string);
            if (result.length != query.count) {
                console.warn('query', query.string);
                console.warn('result', result);
                console.warn(query.string);
                console.warn('expected', query.count);
                console.warn('got', result.length);
            }
        } catch (e) {
            console.warn('failed to query');
            console.warn('query', query.string);
            console.warn(e.message, 'e');
        }
        console.groupEnd();
    });
}

suite('three-queryselectorAll:', function () {

var data
    setup(function(done){
        done();
    });

    test('runs basic test chunk', function () {

        testCSSSelectors()

        assert.is(true);

    });

    suite('tags', function () {
        test('can get scale', function () {
            assert.shallowDeepEqual(this.el.getAttribute('scale'), {
                x: 1, y: 1, z: 1
            });
        });

        test('can get defined scale', function () {
            var el = this.el;
            el.setAttribute('scale', '1 2 3');
            assert.shallowDeepEqual(el.getAttribute('scale'), {
                x: 1, y: 2, z: 3
            });
        });
    });

    suite('classes', function () {
        test('can set scale', function () {
                 assert.equal(el.object3D.scale.z, 3);
        });
    });
});
