# CHANGELOG.md

## 1.0.0 (2019-02-26)

  - New API. The main API is now:  
    ```js
    const asyncTestChain = createTestChain({ /* ctx */ }, { /* props */ })  
    const syncTestChain = createTestChainSync({ /* ctx */ }, { /* props */ })  
    ```
    This replaces the initial API, which had only one object (`props`) and odd rules regarding updating it—hence the MAJOR/BREAKING udpate.
  - Added the `.cached()` helper on both `createTestChain` and `createTestChainSync`.  
  - Added the name of the test step which failed in the error message, if the test step was provied as a named function.
  - Added check up of test steps: null and function are authorized; anything else throws an error.
  - Internal rewrite with async/await. This makes the sync and async code so much more similar, it's uncanny.
  - Added a `cookbook` to the docs, in order to provide examples of how the `test-scenarii` can be used.


## 0.2.4 (2019-02-18)

  - Internal refactoring with a clean split between sync and async implementation (b24938d)
  - Added ESLint config and fixed the code smell it revealed (bf28e70)
  - Updated dependencies (including a Babel 7 update) (1076bfb)
