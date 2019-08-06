const InVessel = require('../dist/invessel');

describe('service', () => {
    test('returns the same instance as the one registered', () => {
        const Foo = function Foo () { this._value = 'Foo service' };

        const vessel = new InVessel();

        const foo = new Foo();
        vessel.service('Foo', foo);

        const firstRetrieval = vessel.get('Foo');

        expect(firstRetrieval).toBe(foo);
    });

    test('returns the same instance on two retrievals', () => {
        const Foo = function Foo () { this._value = 'Foo service' };

        const vessel = new InVessel();

        const foo = new Foo();
        vessel.service('Foo', foo);

        const firstRetrieval = vessel.get('Foo');
        const secondRetrieval = vessel.get('Foo');

        expect(firstRetrieval).toBe(secondRetrieval);
    });
});
