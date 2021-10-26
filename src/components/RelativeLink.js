import PropTypes from 'prop-types';
import React, {createContext, useContext} from 'react';
import {Link as GatsbyLink} from 'gatsby';
import {Link, useColorModeValue} from '@chakra-ui/react';
import {isAbsolute, resolve} from 'path-browserify';

export const PathContext = createContext();

export default function RelativeLink({href, ...props}) {
  const path = useContext(PathContext);
  const linkColor = useColorModeValue('indigo.500', 'indigo.200');

  const isUrl = /^https?:\/\//.test(href);
  const linkProps =
    isUrl || href.startsWith('#')
      ? {href, isExternal: isUrl}
      : {as: GatsbyLink, to: isAbsolute(href) ? href : resolve(path, href)};

  return <Link color={linkColor} {...linkProps} {...props} />;
}

RelativeLink.propTypes = {
  href: PropTypes.string.isRequired
};
