// @flow
const path = require("path");
const {createFilePath} = require("gatsby-source-filesystem");
const normalizeFlowAst = require('./src/normalizeFlowAst');


exports.onCreateWebpackConfig = ({stage, actions}) => {
    actions.setWebpackConfig({
        resolve: {
            alias: {
                react: path.resolve('./node_modules/react'),
                'react-dom': path.resolve('./node_modules/react-dom')
            }
        }
    });
};

exports.onCreateNode = ({node, actions, getNode}) => {
    const {createNodeField} = actions;
    if (node.internal.type === 'Mdx') {
        const {sourceInstanceName} = getNode(node.parent);
        const value = createFilePath({node, getNode});
        createNodeField({node, name: 'slug', value: `${sourceInstanceName}${value}`});
        createNodeField({node, name: 'type', value: sourceInstanceName});
    }
}

exports.createPages = async ({graphql, actions, reporter}) => {

    const result = await graphql(`query { allMdx { edges { node {
        id
        fields {
            slug
            type
        }
    }}}}`);

    if (result.errors) {
        reporter.panicOnBuild('ERROR: Loading "createPages" query');
    }

    // Create blog post pages.
    const posts = result.data.allMdx.edges;


    posts.forEach(({node}, index) => {
        const layouts = {
            api: path.resolve(`./src/components/ApiLayout.js`),
            guides: path.resolve(`./src/components/TutorialLayout.js`)
        };
        actions.createPage({
            path: node.fields.slug,
            component: layouts[node.fields.type],
            context: { id: node.id }
        });
    })
};



