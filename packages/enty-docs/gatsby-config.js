// @flow
const path = require('path');

module.exports = {
    plugins: [
        `gatsby-plugin-flow`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `guides`,
                path: `${__dirname}/src/content/guides`
            }
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `api`,
                path: `${__dirname}/src/content/api`
            }
        },
        {
            resolve: `gatsby-plugin-mdx`,
            options: {
                extensions: ['.mdx', '.md'],
            }
        },
        `gatsby-plugin-styled-components`,
        `gatsby-transformer-remark`,
        {
            resolve: 'gatsby-plugin-web-font-loader',
            options: {
                typekit: {
                    id: 'lne0axq'
                }
            }
        }
    ]
};
