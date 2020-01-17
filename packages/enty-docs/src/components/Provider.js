// @flow
import type {Node} from 'react';
import React from 'react';
import {ThemeProvider} from 'styled-components';
import {MDXProvider} from "@mdx-js/react"
import {Box} from './Layout'
import CodeBlock from './CodeBlock';
import {
    Image,
    Link,
    List,
    ListItem,
    Quote,
    Table,
    TableHeadCell,
    TableCell,
    Text
} from './Affordance';

import Normalize from '../partials/Normalize';
import Denormalize from '../partials/Denormalize';
import Merge from '../partials/Merge';
import Create from '../partials/Create';
import Id from '../partials/Id';
import Name from '../partials/Name';


type Props = {
};

export default function Provider(props: Props): Node {
    const {children, theme} = props;
    const anchor = (value) => value.replace(/ /g, '').toLowerCase();

    const mdxComponents = {
        Normalize,
        Denormalize,
        Create,
        Merge,
        Id,
        Name,
        a: Link,
        blockquote: Quote,
        em: ({children}) => <Text as="em" textStyle="em" my={3}>{children}</Text>,
        h1: ({children: id}) => <Text as="h1" textStyle="h1" mb={3} id={anchor(id)} children={id} />,
        h2: ({children: id}) => <Text as="h2" textStyle="h2" pt={4} mb={3} id={anchor(id)} children={id} />,
        h3: ({children: id}) => <Text as="h3" textStyle="h3" pt={4} mb={3} id={anchor(id)} children={id} />,
        img: (props) => <Image maxWidth="100%" {...props} />,
        inlineCode: ({children}) => <Text as="code" textStyle="code" my={3}>{children}</Text>,
        li: ListItem,
        p: ({children}) => <Text as="p" mb={3}>{children}</Text>,
        strong: ({children}) => <Text as="strong" textStyle="strong" my={3}>{children}</Text>,
        pre: props => <div {...props} />,
        code: (props) => <Box mb={3}><CodeBlock {...props} /></Box>,
        table: (props) => <Box mb={3}><Table {...props} /></Box>,
        th: TableHeadCell,
        td: TableCell,
        ul: ({children}) => <List my={3}>{children}</List>,
        ol: ({children}) => <List as="ol" my={3}>{children}</List>
    };


    return <ThemeProvider theme={theme}>
        <MDXProvider components={mdxComponents} children={children} />
    </ThemeProvider>;

}

