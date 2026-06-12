const DEFAULT_MAX_LINE_LENGTH = 85

const isSingleLine = node => node.loc.start.line === node.loc.end.line

const hasOnlyWhitespaceBetween = (sourceCode, left, right) =>
  sourceCode.text.slice(left.range[1], right.range[0]).trim().length === 0

const linePrefixUntil = (sourceCode, token) => {
  const line = sourceCode.lines[token.loc.end.line - 1] ?? ''

  return line.slice(0, token.loc.end.column)
}

const compactLineLength = (sourceCode, tokenBeforeBody, body) =>
  `${linePrefixUntil(sourceCode, tokenBeforeBody)} ${sourceCode.getText(body)}`
    .length

const isCompactableBody = (sourceCode, body, maxLineLength, headerStartLine) => {
  if (body.type === 'BlockStatement') return false
  if (!isSingleLine(body)) return false

  const tokenBeforeBody = sourceCode.getTokenBefore(body)

  if (!tokenBeforeBody) return false
  if (
    headerStartLine !== undefined &&
    headerStartLine !== tokenBeforeBody.loc.end.line
  )
    return false
  if (tokenBeforeBody.loc.end.line === body.loc.start.line) return false
  if (!hasOnlyWhitespaceBetween(sourceCode, tokenBeforeBody, body)) return false

  return compactLineLength(sourceCode, tokenBeforeBody, body) <= maxLineLength
}

const reportCompactableBody = (
  context,
  sourceCode,
  body,
  maxLineLength,
  headerStartLine,
) => {
  if (!isCompactableBody(sourceCode, body, maxLineLength, headerStartLine)) return

  const tokenBeforeBody = sourceCode.getTokenBefore(body)

  context.report({
    fix(fixer) {
      return fixer.replaceTextRange([tokenBeforeBody.range[1], body.range[0]], ' ')
    },
    messageId: 'compactNonblockStatement',
    node: body,
  })
}

const compactNonblockStatement = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require short non-block control bodies to stay on one line',
    },
    fixable: 'whitespace',
    messages: {
      compactNonblockStatement: 'Move this short statement onto the control line.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          maxLineLength: {
            minimum: 1,
            type: 'integer',
          },
        },
        type: 'object',
      },
    ],
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()
    const [{ maxLineLength = DEFAULT_MAX_LINE_LENGTH } = {}] = context.options

    return {
      DoWhileStatement(node) {
        reportCompactableBody(
          context,
          sourceCode,
          node.body,
          maxLineLength,
          node.loc.start.line,
        )
      },
      ForInStatement(node) {
        reportCompactableBody(
          context,
          sourceCode,
          node.body,
          maxLineLength,
          node.loc.start.line,
        )
      },
      ForOfStatement(node) {
        reportCompactableBody(
          context,
          sourceCode,
          node.body,
          maxLineLength,
          node.loc.start.line,
        )
      },
      ForStatement(node) {
        reportCompactableBody(
          context,
          sourceCode,
          node.body,
          maxLineLength,
          node.loc.start.line,
        )
      },
      IfStatement(node) {
        reportCompactableBody(
          context,
          sourceCode,
          node.consequent,
          maxLineLength,
          node.loc.start.line,
        )

        if (!node.alternate || node.alternate.type === 'IfStatement') return

        reportCompactableBody(context, sourceCode, node.alternate, maxLineLength)
      },
      WhileStatement(node) {
        reportCompactableBody(
          context,
          sourceCode,
          node.body,
          maxLineLength,
          node.loc.start.line,
        )
      },
    }
  },
}

export default compactNonblockStatement
