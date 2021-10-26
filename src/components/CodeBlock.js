import Highlight, {Prism} from 'prism-react-renderer';
import PropTypes from 'prop-types';
import React from 'react';
import fenceparser from 'fenceparser';
import nightOwl from 'prism-react-renderer/themes/nightOwl';
import nightOwlLight from 'prism-react-renderer/themes/nightOwlLight';
import rangeParser from 'parse-numeric-range';
import {
  Box,
  Button,
  chakra,
  useClipboard,
  useColorModeValue
} from '@chakra-ui/react';
import {FiClipboard} from 'react-icons/fi';

export default function CodeBlock({children}) {
  const [child] = Array.isArray(children) ? children : [children];
  const {
    className = 'language-text',
    children: innerChildren,
    metastring,
    'data-meta': dataMeta
  } = child.props;

  const meta = metastring || dataMeta;
  const {title, highlight} = meta ? fenceparser(meta) : {};
  const linesToHighlight = highlight
    ? rangeParser(Object.keys(highlight).toString())
    : [];

  const [code] = Array.isArray(innerChildren) ? innerChildren : [innerChildren];

  const {onCopy, hasCopied} = useClipboard(code);
  const theme = useColorModeValue(nightOwlLight, nightOwl);

  return (
    <Highlight
      Prism={Prism}
      theme={theme}
      code={code.trim()}
      language={className.replace(/language-/, '')}
    >
      {({className, style, tokens, getLineProps, getTokenProps}) => (
        <Box rounded="md" style={style} pos="relative" shadow="sm">
          <Box fontSize="md" fontFamily="mono">
            {title && (
              <Box px="4" py="2" borderBottomWidth="1px">
                {title}
              </Box>
            )}
            <chakra.pre className={className} py="4" fontFamily="inherit">
              {tokens.map((line, i) => (
                <Box
                  key={i}
                  {...getLineProps({
                    line,
                    key: i
                  })}
                  px="4"
                  bg={linesToHighlight.includes(i + 1) && 'blackAlpha.100'}
                >
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({token, key})} />
                  ))}
                </Box>
              ))}
            </chakra.pre>
          </Box>
          <Button
            size="xs"
            pos="absolute"
            top="2"
            right="2"
            leftIcon={<FiClipboard />}
            onClick={onCopy}
          >
            {hasCopied ? 'Copied!' : 'Copy'}
          </Button>
        </Box>
      )}
    </Highlight>
  );
}

CodeBlock.propTypes = {
  children: PropTypes.node.isRequired
};
