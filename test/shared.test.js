const InVessel = require('../dist/invessel');

describe('shared', () => {
    test('defaults to true', () => {
        const vessel = new InVessel();
        expect(vessel.getSharedByDefault()).toBeTruthy();
    });
});
