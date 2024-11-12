import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/index.js', // Replace with the path to your main file
    output: {
        file: 'dist/bundle.js', // Output file path
        format: 'umd',           // Universal Module Definition format
        name: 'analyticsTracker', // Global variable name for browser usage
    },
    plugins: [
        resolve(),    // Allows Rollup to resolve modules from node_modules
        commonjs(),   // Converts CommonJS modules to ES6
    ],
};
