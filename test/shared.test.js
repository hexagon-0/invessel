const InVessel = require('../dist/invessel');

describe('shared', () => {
    test('defaults to true', () => {
        const vessel = new InVessel();
        expect(vessel.getSharedByDefault()).toBeTruthy();
    });

    test('works with non-shared final key and shared alias', () => {
        const vessel = new InVessel();

        const make = (container) => ({ _value: 'xyz' });

        vessel.provider('A', make);
        vessel.setShared('A', false);

        vessel.alias('B', 'A');
        vessel.setShared('B', true);

        const finalKeyRetrieval1 = vessel.get('A');
        const finalKeyRetrieval2 = vessel.get('A');

        const aliasRetrieval1 = vessel.get('B');
        const aliasRetrieval2 = vessel.get('B');

        expect(finalKeyRetrieval1).not.toBe(finalKeyRetrieval2);
        expect(aliasRetrieval1).toBe(aliasRetrieval2);
        expect(aliasRetrieval1).not.toBe(finalKeyRetrieval1);
    });

    test('works with shared final key and non-shared alias', () => {
        const vessel = new InVessel();

        const make = (container) => ({ _value: 'xyz' });

        vessel.provider('A', make);
        vessel.setShared('A', true);

        vessel.alias('B', 'A');
        vessel.setShared('B', false);

        const finalKeyRetrieval1 = vessel.get('A');
        const finalKeyRetrieval2 = vessel.get('A');

        const aliasRetrieval1 = vessel.get('B');
        const aliasRetrieval2 = vessel.get('B');

        expect(finalKeyRetrieval1).toBe(finalKeyRetrieval2);
        expect(aliasRetrieval1).not.toBe(aliasRetrieval2);
        expect(aliasRetrieval1).not.toBe(finalKeyRetrieval1);
    });
});
