// @flow
import type {Node} from 'react';
import React from 'react';
import {graphql} from 'gatsby';
import DocsLayout from './DocsLayout';
import Minimap from './Minimap';
import {NavList, NavListHeading, NavListItem} from './Affordance';

type Props = {};

export default function TutorialLayout({data, children}: Props): Node {
    const {frontmatter, fields, headings, body} = data.mdx;
    return <DocsLayout
        sidebar={<>
            <NavListHeading as="h3" textStyle="strong">Basics</NavListHeading>
            <NavList>
                <NavListItem to="/guides/getting-started">Getting Started</NavListItem>
                <NavListItem to="/guides/normalizing-data">Normalize Some Data (TODO)</NavListItem>
                <NavListItem to="/guides/schemas">Request Hooks & Messages (TODO)</NavListItem>
            </NavList>
            <NavListHeading as="h3" textStyle="strong">Common Things</NavListHeading>
            <NavList>
                <NavListItem to="/guides/common/data-fetching-triggers">Data Fetching Triggers (TODO)</NavListItem>
                <NavListItem to="/guides/common/request-states-and-fallbacks">Request States & Fallbacks (TODO)</NavListItem>
                <NavListItem to="/guides/common/">Schemas (TODO)</NavListItem>
                <NavListItem to="/guides/common/">LoadingBoundary (TODO)</NavListItem>
                <NavListItem to="/guides/common/">Connecting to an API (TODO)</NavListItem>
                <NavListItem to="/guides/common/">Custom Loading Behaviour (TODO)</NavListItem>
                <NavListItem to="/guides/common/service-based-api">Service Based Api (TODO)</NavListItem>
            </NavList>

            <NavListHeading as="h3" textStyle="strong">Advanced & Weird Stuff</NavListHeading>
            <NavList>
                <NavListItem to="/guides/advanced">Observables (TODO)</NavListItem>
                <NavListItem to="/guides/advanced">Websockets (TODO)</NavListItem>
                <NavListItem to="/guides/advanced">Polling (TODO)</NavListItem>
                <NavListItem to="/guides/advanced">List Manipulation (TODO)</NavListItem>
                <NavListItem to="/guides/advanced">Caching (TODO)</NavListItem>
                <NavListItem to="/guides/advanced">Tainted Entities (TODO)</NavListItem>
                <NavListItem to="/guides/advanced">Deleting Entities (TODO)</NavListItem>
            </NavList>
        </>}
        minimap={<Minimap headings={headings} slug={fields.slug} title={frontmatter.title} />}
        body={body}
        title={frontmatter.title}
    />;
}

export const pageQuery = graphql`
  query TutorialLayout($id: String) {
    allFile(filter: {sourceInstanceName: {eq: "tutorial"}}) {
        group(field: childMdx___frontmatter___group) {
            fieldValue
            nodes {
                childMdx {
                    fields {
                        slug
                    }
                    frontmatter {
                        title
                    }
                    headings {
                        value
                        depth
                    }
                }
            }
        }
    }
    mdx(id: { eq: $id }) {
      id
      body
      fields {
          slug
      }
      headings {
          depth
          value
      }
      frontmatter {
        title
      }
    }
  }
`




