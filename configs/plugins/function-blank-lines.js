const lineBreakFor = sourceCode => (sourceCode.text.includes('\r\n') ? '\r\n' : '\n')

const LONG_BLOCK_MIN_LINES = 4

const indentationFor = (sourceCode, token) => {
  const line = sourceCode.lines[token.loc.start.line - 1] ?? ''

  return line.slice(0, token.loc.start.column)
}

const spacingBefore = (sourceCode, token, blankLines) =>
  `${lineBreakFor(sourceCode).repeat(blankLines + 1)}${indentationFor(
    sourceCode,
    token,
  )}`

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

const reportPadding = (
  context,
  sourceCode,
  node,
  leftToken,
  rightToken,
  maxBlankLines,
  messageId,
) => {
  const sequences = paddingLineSequencesBetween(sourceCode, leftToken, rightToken)

  if (blankLineCount(sequences) <= maxBlankLines) return

  const [firstSequence] = sequences

  context.report({
    fix(fixer) {
      if (hasTokensBetween(sourceCode, leftToken, rightToken)) return null

      return fixer.replaceTextRange(
        [leftToken.range[1], rightToken.range[0]],
        spacingBefore(sourceCode, rightToken, maxBlankLines),
      )
    },
    loc: {
      end: firstSequence.rightToken.loc.start,
      start: {
        column: 0,
        line: firstSequence.leftToken.loc.end.line + 1,
      },
    },
    messageId,
    node,
  })
}

const isReturnStatement = node => node.type === 'ReturnStatement'

const isCompactReturnIfStatement = node =>
  node.type === 'IfStatement' &&
  !node.alternate &&
  isReturnStatement(node.consequent) &&
  node.loc.start.line === node.consequent.loc.start.line

const isReturnLikeStatement = node =>
  isReturnStatement(node) || isCompactReturnIfStatement(node)

const lineCountFor = node => node.loc.end.line - node.loc.start.line + 1

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

const isLongBlockStatement = node =>
  hasBlockBody(node) && lineCountFor(node) >= LONG_BLOCK_MIN_LINES

const messageIdForStatementGap = (previousStatement, nextStatement) => {
  if (isReturnStatement(previousStatement)) return 'unexpectedBlankLineAfterReturn'
  if (isReturnLikeStatement(nextStatement)) return 'tooManyBlankLinesBeforeReturn'

  return 'unexpectedBlankLine'
}

const maxBlankLinesForStatementGap = (previousStatement, nextStatement) => {
  if (isReturnStatement(previousStatement)) return 0
  if (isReturnLikeStatement(nextStatement)) return 1
  if (isLongBlockStatement(previousStatement)) return 1
  if (isLongBlockStatement(nextStatement)) return 1

  return 0
}

const checkStatementList = (
  context,
  sourceCode,
  node,
  statements,
  leftToken,
  rightToken,
) => {
  if (statements.length === 0) {
    reportPadding(
      context,
      sourceCode,
      node,
      leftToken,
      rightToken,
      0,
      'unexpectedBlankLine',
    )
    return
  }

  const [firstStatement] = statements
  const lastStatement = statements[statements.length - 1]

  reportPadding(
    context,
    sourceCode,
    firstStatement,
    leftToken,
    sourceCode.getFirstToken(firstStatement),
    0,
    'unexpectedBlankLine',
  )

  for (let index = 1; index < statements.length; index += 1) {
    const previousStatement = statements[index - 1]
    const nextStatement = statements[index]

    reportPadding(
      context,
      sourceCode,
      nextStatement,
      sourceCode.getLastToken(previousStatement),
      sourceCode.getFirstToken(nextStatement),
      maxBlankLinesForStatementGap(previousStatement, nextStatement),
      messageIdForStatementGap(previousStatement, nextStatement),
    )
  }

  reportPadding(
    context,
    sourceCode,
    lastStatement,
    sourceCode.getLastToken(lastStatement),
    rightToken,
    0,
    isReturnStatement(lastStatement)
      ? 'unexpectedBlankLineAfterReturn'
      : 'unexpectedBlankLine',
  )
}

const caseColonToken = (sourceCode, node) => {
  const tokenBeforeConsequent = sourceCode.getTokenBefore(node.consequent[0])

  if (tokenBeforeConsequent?.value === ':') return tokenBeforeConsequent

  const firstToken = sourceCode.getFirstToken(node)

  return sourceCode.getTokenAfter(firstToken, {
    filter: token => token.value === ':',
  })
}

const caseEndToken = (sourceCode, node) => {
  const lastStatement = node.consequent[node.consequent.length - 1]

  return sourceCode.getTokenAfter(sourceCode.getLastToken(lastStatement))
}

const functionBlankLines = {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Disallow extra blank lines in functions except before return statements',
    },
    fixable: 'whitespace',
    messages: {
      tooManyBlankLinesBeforeReturn:
        'Return statements may have at most one blank line above them.',
      unexpectedBlankLine: 'Unexpected blank line inside function.',
      unexpectedBlankLineAfterReturn: 'Unexpected blank line after return.',
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

        checkStatementList(
          context,
          sourceCode,
          node,
          node.body,
          sourceCode.getFirstToken(node),
          sourceCode.getLastToken(node),
        )
      },
      FunctionDeclaration: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      FunctionExpression: enterFunction,
      'FunctionExpression:exit': exitFunction,
      SwitchCase(node) {
        if (!isInsideFunction()) return
        if (node.consequent.length === 0) return

        checkStatementList(
          context,
          sourceCode,
          node,
          node.consequent,
          caseColonToken(sourceCode, node),
          caseEndToken(sourceCode, node),
        )
      },
    }
  },
}

export default functionBlankLines
