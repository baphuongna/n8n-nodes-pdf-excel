module.exports = {
  extends: ["./.eslintrc.js"],
  rules: {
    "n8n-nodes-base/node-execute-block-missing-continue-on-fail": "error",
    "n8n-nodes-base/node-resource-description-missing": "error",
    "n8n-nodes-base/node-param-description-missing": "error",
    "n8n-nodes-base/node-param-option-name-containing-star": "error",
    "n8n-nodes-base/node-param-option-name-containing-circular-references": "error",
    "n8n-nodes-base/node-param-option-name-wrong-for-get-all": "error",
    "n8n-nodes-base/node-param-option-name-wrong-for-update": "error",
    "n8n-nodes-base/node-param-option-name-wrong-for-delete": "error",
  },
};
