// @flow
import React, {useContext, useEffect, useState} from 'react'
import styled, {ThemeContext} from 'styled-components';
import {LiveProvider, LiveEditor, LiveError, LivePreview} from 'react-live';
import {mdx} from '@mdx-js/react'
import * as Enty from 'react-enty';
import JSONTree from 'react-json-tree';
import faker from 'faker';

const Editor = styled(LiveEditor)`
    height: 100%;
    flex-basis: 50%;
    flex-shrink: 0;
    flex-grow: 1;
`;


const Preview = styled(LivePreview)`
    flex-basis: 50%;
    flex-shrink: 0;
    background-color: ${_ => _.theme.colors.grey100};
`;

const Error = styled(LiveError)`
    color: white;
    background-color: ${_ => _.theme.colors.red};
    font-family: ${_ => _.theme.fonts.code};
    font-size: 13px;
    padding: .5rem;
    white-space: pre-wrap;
`;


function CodeResult(props) {
    const {children} = props;
    const {colors, fonts} = useContext(ThemeContext);

    return <JSONTree
        data={children}
        invertTheme={false}
        theme={{
            tree: {
                margin: '0',
                marginLeft: '1.75rem',
                width: '100%',
                height: '100%',
                padding: '.5rem',
                paddingLeft: '2.5rem',
                fontFamily: fonts.code,
                backgroundColor: 'inherit',
                fontSize: '13px',
                display: 'block'
            },
            value: {padding: '0', margin: '0', paddingLeft: '1rem', textIndent: '0'},
            nestedNode: {padding: '0', margin: '0', paddingLeft: '0'},
            nestedNodeChildren: {
                paddingLeft: '1rem'
            },
            arrowContainer: {
                marginLeft: '-1.5rem'
            },
            extend: {
                base00: colors.hairline,
                base01: colors.fg,
                base02: colors.fg,
                base03: colors.comment, // meta
                base04: colors.fg,
                base05: colors.fg,
                base06: colors.fg,
                base07: colors.fg,
                base08: colors.comment,
                base09: colors.comment, // number
                base0A: colors.fg,
                base0B: colors.comment, // string
                base0C: colors.fg,
                base0D: colors.muted, // keys
                base0E: colors.fg,
                base0F: colors.fg
            }
        }}
    />;

}

export default function CodeBlock(props) {
    const {children, live = false} = props;
    const {codeTheme} = useContext(ThemeContext);
    //transformCode={code => '/** @jsx mdx */' + code}
    return <LiveProvider
        code={children.trim()}
        theme={codeTheme}
        scope={{
            mdx,
            JSON: CodeResult,
            useEffect,
            useState,
            faker,
            ...Enty
        }}
    >
        <Editor />
        {live && <Preview />}
        {live && <Error/>}
    </LiveProvider>;
}
