const lineBreakFor = sourceCode => (sourceCode.text.includes('\r\n') ? '\r\n' : '\n')

const indentationFor = (sourceCode, token) => {
  const line = sourceCode.lines[token.loc.start.line - 1] ?? ''

  return line.slice(0, token.loc.start.column)
}

const spacingBefore = (sourceCode, token) =>
  `${lineBreakFor(sourceCode)}${indentationFor(sourceCode, token)}`

const paddingLineSequencesBetween = (sourceCode, leftToken, rightToken) => {
  const sequences = []
  let previousToken = leftToken

  while (previousToken.range[0] < rightToken.range[0]) {
    const nextToken = sourceCode.getTokenAfter(previousToken, {
      includeComments: true,
    })

    if (!nextToken || nextToken.range[0] > rightToken.range[0]) break

    const blankLines = nextToken.loc.start.line - previousToken.loc.end.line - 1

    if (blankLines > 0) {
      sequences.push({
        blankLines,
        leftToken: previousToken,
        rightToken: nextToken,
      })
    }

    previousToken = nextToken
  }

  return sequences
}

const blankLineCount = sequences =>
  sequences.reduce((count, sequence) => count + sequence.blankLines, 0)

const hasTokensBetween = (sourceCode, leftToken, rightToken) =>
  sourceCode.getTokensBetween(leftToken, rightToken, { includeComments: true })
    .length > 0

const hasBlockBody = node => {
  if (node.type === 'BlockStatement') return true
  if (node.type === 'FunctionDeclaration') return true
  if (node.type === 'SwitchStatement') return true
  if (node.type === 'TryStatement') return true
  if (node.type === 'IfStatement') {
    if (hasBlockBody(node.consequent)) return true

    return Boolean(node.alternate && hasBlockBody(node.alternate))
  }

  return node.body?.type === 'BlockStatement'
}

const isSingleLineStatement = node => node.loc.start.line === node.loc.end.line

const isRestrictedStatement = node =>
  isSingleLineStatement(node) && !hasBlockBody(node)

const reportUnexpectedBlankLine = (
  context,
  sourceCode,
  previousStatement,
  nextStatement,
) => {
  const leftToken = sourceCode.getLastToken(previousStatement)
  const rightToken = sourceCode.getFirstToken(nextStatement)
  const sequences = paddingLineSequencesBetween(sourceCode, leftToken, rightToken)

  if (blankLineCount(sequences) === 0) return

  const [firstSequence] = sequences

  context.report({
    fix(fixer) {
      if (hasTokensBetween(sourceCode, leftToken, rightToken)) return null

      return fixer.replaceTextRange(
        [leftToken.range[1], rightToken.range[0]],
        spacingBefore(sourceCode, rightToken),
      )
    },
    loc: {
      end: firstSequence.rightToken.loc.start,
      start: {
        column: 0,
        line: firstSequence.leftToken.loc.end.line + 1,
      },
    },
    messageId: 'unexpectedBlankLine',
    node: nextStatement,
  })
}

const checkStatementPairs = (context, sourceCode, statements) => {
  for (let index = 1; index < statements.length; index += 1) {
    const previousStatement = statements[index - 1]
    const nextStatement = statements[index]

    if (!isRestrictedStatement(previousStatement)) continue
    if (!isRestrictedStatement(nextStatement)) continue

    reportUnexpectedBlankLine(context, sourceCode, previousStatement, nextStatement)
  }
}

const functionBlankLines = {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Disallow blank lines between adjacent single-line non-block statements',
    },
    fixable: 'whitespace',
    messages: {
      unexpectedBlankLine:
        'Unexpected blank line between adjacent single-line statements.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    let functionDepth = 0

    const enterFunction = () => {
      functionDepth += 1
    }

    const exitFunction = () => {
      functionDepth -= 1
    }

    const isInsideFunction = () => functionDepth > 0

    return {
      ArrowFunctionExpression: enterFunction,
      'ArrowFunctionExpression:exit': exitFunction,
      BlockStatement(node) {
        if (!isInsideFunction()) return

        checkStatementPairs(context, sourceCode, node.body)
      },
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      SwitchCase(node) {
        if (!isInsideFunction()) return

        checkStatementPairs(context, sourceCode, node.consequent)
      },
    }
  },
}

export default functionBlankLines
