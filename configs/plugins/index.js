import compactNonblockStatement from './compact-nonblock-statement.js'
import compactReturnIf from './compact-return-if.js'
import functionBlankLines from './function-blank-lines.js'

export default {
  rules: {
    'compact-nonblock-statement': compactNonblockStatement,
    'compact-return-if': compactReturnIf,
    'function-blank-lines': functionBlankLines,
  },
}
