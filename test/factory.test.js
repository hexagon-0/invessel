const InVessel = require('../dist/invessel');

describe('factory', () => {
    test('returns a function corresponding to a \'get\' call on the container', () => {
        const vessel = new InVessel();

        vessel.service('Alpha', { _value: 127 });
        const factory = vessel.factory('Alpha');

        expect(factory()).toBe(vessel.get('Alpha'));
    });
});
