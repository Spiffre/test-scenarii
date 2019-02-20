
import {
	setChainProps,
} from './utils.js'

import {
	UnauthorizedPropChangeError
} from './deprecated/utils.js'

import { createTestChain } from './async.js'
import { createTestChain as createTestChainSync } from './sync.js'

//import { createTestChain } from './deprecated/async.js'
//import { createTestChain as createTestChainSync } from './deprecated/sync.js'

export {
	setChainProps,
	UnauthorizedPropChangeError,

	createTestChain,
	createTestChainSync
}
