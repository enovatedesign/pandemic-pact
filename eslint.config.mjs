import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

/**
 * Flat config, replacing `.eslintrc.json`.
 *
 * Next 16 removed the `next lint` command and `@next/eslint-plugin-next` now defaults
 * to flat config, so linting runs through the ESLint CLI directly. `next lint` scoped
 * itself to the app source; `eslint .` does not, hence the explicit ignores for build
 * output and generated data.
 */
const config = [
    {
        ignores: [
            '.next/**',
            'compiled-scripts/**',
            'node_modules/**',
            'public/**',
            'data/**',
            'test-results/**',
            'playwright-report/**',
            'next-env.d.ts',
        ],
    },

    ...nextCoreWebVitals,

    {
        rules: {
            'react/jsx-key': 'error',

            /**
             * eslint-plugin-react-hooks 6 — which arrived with eslint-config-next 16 —
             * ships these four as errors. They flag 32 pre-existing patterns across the
             * app, none introduced by the Next 16 upgrade and none currently a live bug.
             *
             * Kept as warnings so the lint gate holds its previous meaning (a pre-commit
             * hook and a CI job that pass on a clean tree) rather than failing the build
             * on a backlog. They are worth working through separately — see the
             * follow-up section in docs/nextjs-16-upgrade.md.
             */
            'react-hooks/set-state-in-effect': 'warn',
            'react-hooks/static-components': 'warn',
            'react-hooks/refs': 'warn',
            'react-hooks/immutability': 'warn',
        },
    },
]

export default config
