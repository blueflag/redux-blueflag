// @flow
import type {Node} from 'react';

import React from 'react';
import styled from 'styled-components';
import {Flex, Box, Wrapper} from './Layout';
import {NavigationLink} from './Affordance';
import Logo from '../images/logo.svg';


type Props = {
};

function Navigation(props: Props): Node {
    const api = <NavigationLink to="/api/enty/entity-schema" textStyle="navigationLink">Api</NavigationLink>;
    const guides = <NavigationLink to="/guides/getting-started" textStyle="navigationLink">Guides</NavigationLink>;
    const logo = <NavigationLink to="/" textStyle="navigationLink">
        <Flex>
            <Box><img src={Logo} height="24px" alt="Enty" /></Box>
            <Box ml={2}>Enty</Box>
        </Flex>
    </NavigationLink>;

    return <Box className={props.className}>
        <Wrapper>
            <Flex justifyContent="space-between" py={3} px={{_:3, sm: 4}}>
                {logo}
                <Flex>
                    <Box px={2}>{api}</Box>
                    <Box px={2}>{guides}</Box>
                </Flex>
            </Flex>
        </Wrapper>
    </Box>;
}

export default styled(Navigation)`
    background-color: ${p => p.theme.colors.alpha};,
`;
