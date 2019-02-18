
import {
	setChainProps,
	updateContext,
	UnauthorizedPropChangeError
} from './utils'

import { createTestChain } from './async_DEPRECATED.js'
import { createTestChain as createTestChainSync } from './sync_DEPRECATED.js'

export {
	setChainProps,
	UnauthorizedPropChangeError,

	createTestChain,
	createTestChainSync
}
