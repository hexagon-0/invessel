import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
    input: 'src/InVessel.js',
    output: [
        {
            file: 'dist/invessel.js',
            format: 'umd',
            name: 'InVessel'
        },
        {
            file: 'dist/invessel.module.js',
            format: 'esm'
        }
    ],
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**',
            presets: ['@babel/env']
        })
    ]
};
