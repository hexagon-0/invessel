const InVessel = require('../dist/invessel');

describe('alias', () => {
    test('resolves to target service', () => {
        const vessel = new InVessel();

        const qux = { _value: 'Qux service' };
        vessel.service('Qux', qux);
        vessel.alias('Realm', 'Qux');

        const finalKeyRetrieval = vessel.get('Qux');
        const aliasRetrieval = vessel.get('Realm');

        expect(aliasRetrieval).toBe(finalKeyRetrieval);
    });

    test('has a shared flag independent from the final key\'s flag', () => {
        const vessel = new InVessel();

        const CraftFactory = container => ({ _value: 'Craft service' });
        vessel.factory('Craft', CraftFactory);
        vessel.alias('Lure', 'Craft');
        vessel.setShared('Craft', false);
        vessel.setShared('Lure', true);

        const finalKeyFirstRetrieval = vessel.get('Craft');
        const aliasFirstRetrieval = vessel.get('Lure');
        const finalKeySecondRetrieval = vessel.get('Craft');
        const aliasSecondRetrieval = vessel.get('Lure');

        expect(finalKeySecondRetrieval).not.toBe(finalKeyFirstRetrieval);
        expect(aliasSecondRetrieval).toBe(aliasFirstRetrieval);
        expect(aliasFirstRetrieval).not.toBe(finalKeyFirstRetrieval);
        expect(aliasFirstRetrieval).not.toBe(finalKeySecondRetrieval);
    });

    test('throws on cyclic alias definition', () => {
        const vessel = new InVessel({
            services: {
                'BlackMambo': 'Concrete'
            },
            aliases: {
                'WallaWalla': 'BlackMambo',
                'Flip': 'WallaWalla'
            }
        });

        expect(() => vessel.alias('WallaWalla', 'Flip')).toThrow(/^Cyclic alias 'WallaWalla'\.$/);
    });

    test('allows an alias to be registered for non-existing target, and resolve it when the target is registered', () => {
        const vessel = new InVessel({
            aliases: {
                'Burn': 'Defy'
            }
        });

        expect(vessel.has('Burn')).toBeFalsy();

        vessel.service('Defy', 'Not today');

        expect(vessel.has('Burn')).toBeTruthy();

        const finalKeyRetrieval = vessel.get('Defy');
        const aliasRetrieval = vessel.get('Burn');

        expect(aliasRetrieval).toBe(finalKeyRetrieval);
    });
});
