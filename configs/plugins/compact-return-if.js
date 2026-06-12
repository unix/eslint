const getIfPrefix = (sourceCode, node) =>
  sourceCode.text.slice(node.range[0], node.consequent.range[0]).trimEnd()

const hasBlockComment = (sourceCode, block) =>
  sourceCode.getCommentsInside(block).length > 0

const isBlockWithOneStatement = node => {
  if (node.type !== 'BlockStatement') return false

  return node.body.length === 1
}

const isSingleLineReturn = statement => {
  if (statement.type !== 'ReturnStatement') return false

  return statement.loc.start.line === statement.loc.end.line
}

const getReturnStatement = node => {
  if (node.alternate) return undefined
  if (!isBlockWithOneStatement(node.consequent)) return undefined

  return node.consequent.body[0]
}

const isCompactableReturn = (sourceCode, node, statement) => {
  if (!isSingleLineReturn(statement)) return false
  if (hasBlockComment(sourceCode, node.consequent)) return false

  return node.loc.start.line === node.consequent.loc.start.line
}

const getCompactReturnStatement = (sourceCode, node) => {
  const statement = getReturnStatement(node)

  if (!statement) return undefined
  if (!isCompactableReturn(sourceCode, node, statement)) return undefined

  return statement
}

const compactReturnIf = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Require single-return if statements to use a compact body',
    },
    fixable: 'code',
    messages: {
      compactReturnIf: 'Unnecessary braces around single-line return.',
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    return {
      IfStatement(node) {
        const statement = getCompactReturnStatement(sourceCode, node)

        if (!statement) return

        context.report({
          fix(fixer) {
            return fixer.replaceTextRange(
              [node.range[0], node.consequent.range[1]],
              `${getIfPrefix(sourceCode, node)} ${sourceCode.getText(statement)}`,
            )
          },
          messageId: 'compactReturnIf',
          node: node.consequent,
        })
      },
    }
  },
}

export default compactReturnIf
