const generatorUniqueAst = (left, right = "") => {
  return {
    type: "JSXExpressionContainer",
    expression: {
      type: "TemplateLiteral",
      expressions: [{ type: "Identifier", name: "unique" }],
      quasis: [
        {
          type: "TemplateElement",
          value: { raw: left, cooked: left },
          tail: false,
        },
        {
          type: "TemplateElement",
          value: { raw: right, cooked: right },
          tail: true,
        },
      ],
    },
  };
};

const walkTree = (node, cb) => {
  if (node.type === "JSXElement") {
    cb(node);
    if (node.children?.length > 0) {
      node.children.forEach((n) => walkTree(n, cb));
    }
  }
};
const getNodeByOpeningElementName = (node, name) => {
  let r = [];
  walkTree(node, (n) => {
    if (n.openingElement.name.name === name) {
      r.push(n);
    }
  });
  return r[0];
};

const getNodeByOpeningElementAttrs = (node) => {
  let r = {};
  if (node.type === "JSXElement") {
    node.openingElement.attributes?.forEach((attr) => {
      r[attr.name.name] = attr.value.value;
    });
  }
  return r;
};

const svgrTemplate = (
  { template },
  opts,
  { imports, interfaces, componentName, props, jsx, exports }
) => {
  const plugins = ["jsx"];

  if (opts.typescript) {
    plugins.push("typescript");
  }

  const typeScriptTpl = template.smart({
    plugins,
  });

  const defsNode = getNodeByOpeningElementName(jsx, "defs");
  if (defsNode) {
    const defsIds = defsNode.children
      .filter((node) => node.type === "JSXElement")
      .map((node) => getNodeByOpeningElementAttrs(node)["id"]);
    defsIds.forEach((id) => {
      if (id) {
        walkTree(jsx, (node) => {
          node.openingElement.attributes?.forEach((attr) => {
            const value = attr.value.value;
            if (typeof value === "string" && value.includes(id)) {
              const [left, right] = value.split(id);
              attr.value = generatorUniqueAst(`${left}${id}_`, right);
            }
          });
        });
      }
    });
  }
  return typeScriptTpl.ast`
    ${imports}
    ${interfaces}
    function ${componentName}(${props}) {
      const unique = Math.random().toString(36).substring(2);
      return ${jsx}
    }
    ${exports}`;
};

module.exports = svgrTemplate;
