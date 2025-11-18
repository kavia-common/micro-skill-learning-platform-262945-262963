#!/bin/bash
cd /home/kavia/workspace/code-generation/micro-skill-learning-platform-262945-262963/backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

