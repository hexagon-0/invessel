const InVessel = require('../dist/invessel');

describe('provider', () => {
    test('calls the get method only once if the entry is shared', () => {
        const vessel = new InVessel();

        const provider = {
            getCalls: 0,
            get (container) {
                this.getCalls++;
                const o = { _value: 'Epsilon service' };
                return o;
            }
        };
        vessel.provider('Epsilon', provider);

        const firstRetrieval = vessel.get('Epsilon');
        expect(provider.getCalls).toBe(1);

        const secondRetrieval = vessel.get('Epsilon');
        expect(provider.getCalls).toBe(1);
    });

    test('calls the get method every time the entry is requested if not shared', () => {
        const vessel = new InVessel();

        const provider = {
            getCalls: 0,
            get (container) {
                this.getCalls++;
                const o = { _value: 'Epsilon service' };
                return o;
            }
        };
        vessel.provider('Epsilon', provider);
        vessel.setShared('Epsilon', false);

        const firstRetrieval = vessel.get('Epsilon');
        expect(provider.getCalls).toBe(1);

        const secondRetrieval = vessel.get('Epsilon');
        expect(provider.getCalls).toBe(2);
    });
});
