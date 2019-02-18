# CHANGELOG.md

## 0.3.0 (unreleased)

  - New accessors for the new API:  
    `import { createTestChain } from 'test-scenarii/async'`  
    `import { createTestChain } from 'test-scenarii/sync'`  
    The old API is still accessible from  
	`import { createTestChain } from 'test-scenarii'`  
    `import { createTestChain } from 'test-scenarii'`  

## 0.2.4 (2019-02-18)

  - Internal refactoring with a clean split between sync and async implementation (b24938d)
  - Added ESLint config and fixed the code smell it revealed (bf28e70)
  - Updated dependencies (including a Babel 7 update) (1076bfb)
