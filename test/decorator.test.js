const InVessel = require('../dist/invessel');

describe('decorator', () => {
    test('receives the container, requested key and creation callback, and returns a service', () => {
        const vessel = new InVessel();

        vessel.service('Labeler', (label) => label + ' service');

        vessel.provider('Furniture', container => {
            return { _value: 8 };
        });

        vessel.decorator('Furniture', (container, key, create) => {
            const s = create();
            const labeler = container.get('Labeler');
            s.label = labeler(key);
            return s;
        });

        const result = vessel.get('Furniture');

        expect(result).toEqual({ _value: 8, label: 'Furniture service' });
    });

    test('applies final key decorators to its aliases', () => {
        const vessel = new InVessel();

        vessel.provider('Furniture', container => {
            return { _value: 8 };
        });
        vessel.setShared('Furniture', false);

        vessel.alias('Prop', 'Furniture');
        vessel.setShared('Prop', false);

        vessel.decorator('Furniture', (container, key, create) => {
            const s = create();
            s.furnitureDecorated = true;
            return s;
        });

        vessel.decorator('Prop', (container, key, create) => {
            const s = create();
            s.propDecorated = true;
            return s;
        });

        const finalKeyResult = vessel.get('Furniture');
        const aliasResult = vessel.get('Prop');

        expect(aliasResult).not.toBe(finalKeyResult);
        expect(finalKeyResult.furnitureDecorated).toBeTruthy;
        expect(finalKeyResult.propDecorated).toBeFalsy;
        expect(aliasResult.furnitureDecorated).toBeTruthy;
        expect(aliasResult.propDecorated).toBeFalsy;
    });

    test('applies multiple decorators in registration order', () => {
        const vessel = new InVessel();

        const make = (container) => ({ _value: [33] });

        vessel.provider('Doom', make);
        vessel.decorator('Doom', (container, key, create) => {
            const s = create();
            s._value.push(44);
            return s;
        });
        vessel.decorator('Doom', (container, key, create) => {
            const s = create();
            s._value.push(55);
            return s;
        });

        const result = vessel.get('Doom');
        expect(result).toEqual({ _value: [33, 44, 55] });
    });
});
