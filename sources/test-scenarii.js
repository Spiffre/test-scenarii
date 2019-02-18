
import {
	setChainProps,
	updateContext,
	UnauthorizedPropChangeError
} from './utils'

import { createTestChain } from './async.js'
import { createTestChain as createTestChainSync } from './sync.js'

export {
	setChainProps,
	UnauthorizedPropChangeError,

	createTestChain,
	createTestChainSync
}

